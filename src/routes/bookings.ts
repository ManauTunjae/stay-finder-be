import { Hono } from "hono";
import type { NewBooking } from "../types/booking.js";
import * as db from "../database/booking.js";
import * as dbProperty from "../database/property.js";
import {
  bookingGuestsValidator,
  bookingValidator,
} from "../validators/bookingValidator.js";
import bookingParamValidator from "../validators/bookingParamValidator.js";
import { requireAuth } from "../middleware/auth.js";
import { calculateNights, getTodayDate } from "../utils/date.js";
import { property } from "zod";

const bookings = new Hono({ strict: false });

bookings.get("/", requireAuth, async (c) => {
  const supabase = c.get("supabase");
  try {
    const allBookings = await db.getBookings(supabase);
    return c.json(allBookings);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Could not fetch bookings" }, 500);
  }
});

bookings.get("/:id", requireAuth, bookingParamValidator, async (c) => {
  const { id } = c.req.valid("param");
  const supabase = c.get("supabase");
  try {
    const booking = await db.getBookingById(supabase, id);
    if (!booking) {
      return c.json({ error: "Booking not found" }, 404);
    }
    return c.json(booking);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Could not fetch booking" }, 500);
  }
});

bookings.post("/", requireAuth, bookingValidator, async (c) => {
  const supabase = c.get("supabase");
  const newBooking: NewBooking = c.req.valid("json");
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const property = await dbProperty.getPropertyById(
      supabase,
      newBooking.property_id,
    );

    if (!property) {
      return c.json({ error: "Property not found" }, 404);
    }

    if (newBooking.guests > property.max_guests) {
      return c.json(
        {
          error: `This property allows a maximum of ${property.max_guests} guests`,
        },
        400,
      );
    }

    if (newBooking.check_in < getTodayDate()) {
      return c.json({ error: "Check-in date cannot be in the past" }, 400);
    }

    const nights = calculateNights(newBooking.check_in, newBooking.check_out);
    const totalPrice = nights * property.price_per_night;
    const booking = await db.createBooking(
      supabase,
      { ...newBooking, status: "pending", total_price: totalPrice },
      user.id,
    );
    return c.json(booking, 201);
  } catch (error) {
    console.error(error);
    return c.json(
      {
        error: "Could not create new booking",
      },
      500,
    );
  }
});

// uppdatera bokning status to cancelled
bookings.patch("/:id/cancel", requireAuth, bookingParamValidator, async (c) => {
  const supabase = c.get("supabase");
  const { id } = c.req.valid("param");
  try {
    const booking = await db.getBookingById(supabase, id);
    if (!booking) {
      return c.json({ error: "Booking not found" }, 404);
    }

    if (booking.check_in < getTodayDate()) {
      return c.json(
        {
          error: `Cannot cancel booking: check-in date ${booking.check_in} has already passed`,
        },
        409,
      );
    }

    if (booking.status === "cancelled") {
      return c.json({ error: "This booking is already cancelled." }, 409);
    }
    const cancelledBooking = await db.updateBookingStatus(
      supabase,
      id,
      "cancelled",
    );
    return c.json(cancelledBooking);
  } catch (error) {
    console.error(error);
    return c.json(
      {
        error: "Could not cancel a booking",
      },
      500,
    );
  }
});

// update booking status to confirm by owner
bookings.patch(
  "/:id/confirm",
  requireAuth,
  bookingParamValidator,
  async (c) => {
    const supabase = c.get("supabase");
    const { id } = c.req.valid("param");
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    try {
      const booking = await db.getBookingById(supabase, id);
      if (!booking) {
        return c.json({ error: "Booking not found" }, 404);
      }

      const property = await dbProperty.getPropertyById(
        supabase,
        booking.property_id,
      );
      if (!property) {
        return c.json({ error: "Property not found" }, 404);
      }

      if (property.host_id !== user.id) {
        return c.json(
          { error: "Only the property owner can confirm this booking" },
          403,
        );
      }

      if (booking.check_in < getTodayDate()) {
        return c.json(
          {
            error: `Cannot confirm booking: check-in date ${booking.check_in} has already passed`,
          },
          409,
        );
      }

      if (booking.status !== "pending") {
        return c.json(
          {
            error: "Only pending bookings can be confirmed",
          },
          409,
        );
      }

      const confirmedBooking = await db.updateBookingStatus(
        supabase,
        id,
        "confirmed",
      );
      return c.json(confirmedBooking);
    } catch (error) {
      console.error(error);
      return c.json(
        {
          error: "Could not confirm a booking",
        },
        500,
      );
    }
  },
);

bookings.patch(
  "/:id/guests",
  requireAuth,
  bookingParamValidator,
  bookingGuestsValidator,
  async (c) => {
    const supabase = c.get("supabase");
    const { id } = c.req.valid("param");
    const user = c.get("user");
    const { guests } = c.req.valid("json");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    try {
      const booking = await db.getBookingById(supabase, id);
      if (!booking) {
        return c.json({ error: "Booking not found" }, 404);
      }

      if (booking.guest_id !== user.id) {
        return c.json(
          { error: "Only the booking owner can change this booking" },
          403,
        );
      }

      if (booking.status !== "pending") {
        return c.json({ error: "Only pending bookings can be changed" }, 409);
      }

      if (booking.check_in < getTodayDate()) {
        return c.json(
          {
            error: `Cannot change booking: check-in date ${booking.check_in} has already passed`,
          },
          409,
        );
      }

      const property = await dbProperty.getPropertyById(
        supabase,
        booking.property_id,
      );

      if (!property) {
        return c.json({ error: "Property not found" }, 404);
      }

      if (guests > property.max_guests) {
        return c.json(
          {
            error: `This property allows a maximum of ${property.max_guests} guests`,
          },
          400,
        );
      }

      const updatedBooking = await db.updateBooking(supabase, id, { guests });
      return c.json(updatedBooking);
    } catch (error) {
      console.error(error);
      return c.json(
        {
          error: "Could not update a booking",
        },
        500,
      );
    }
  },
);

// bookings.delete("/:id", async (c) => {
//   const allbookings = await getBookings();
//   const bookingId = c.req.param("id");

//   const bookingIndex = allbookings.findIndex((b) => b.booking_id === bookingId);

//   if (bookingIndex === -1) {
//     return c.json({ error: "Booking not found" }, 404);
//   }

//   allbookings.splice(bookingIndex, 1);

//   try {
//     await saveBookings(allbookings);
//   } catch (error) {
//     return c.json({ error: "Could not delete booking" }, 500);
//   }
//   return c.json({ message: "Booking is deleted" }, 200);
// });

export default bookings;
