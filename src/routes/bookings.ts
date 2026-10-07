import { Hono } from "hono";
import type { NewBooking } from "../types/booking.js";
import * as db from "../database/booking.js";
import * as dbProperty from "../database/property.js";
import { bookingValidator } from "../validators/bookingValidator.js";
import bookingParamValidator from "../validators/bookingParamValidator.js";
import { requireAuth } from "../middleware/auth.js";
import { calculateNights } from "../database/booking.js";
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
      newBooking.property_id
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
    
    const nights = calculateNights(newBooking.check_in, newBooking.check_out);
    const totalPrice = nights * property.price_per_night;
    const booking = await db.createBooking(supabase, {...newBooking, status: "pending", total_price: totalPrice}, user.id);
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

// bookings.patch("/:id", bookingOptionalValidator, async (c) => {
//   const allBookings = await getBookings();
//   const bookingId = c.req.param("id");

//   const bookingIndex = allBookings.findIndex((b) => b.booking_id === bookingId);

//   if (bookingIndex === -1) {
//     return c.json({ error: "Booking not found" }, 404);
//   }
//   const bookingBody: Partial<Booking> = c.req.valid("json");

//   allBookings[bookingIndex] = {
//     ...allBookings[bookingIndex],
//     ...bookingBody,
//     booking_id: allBookings[bookingIndex].booking_id,
//   };
//   try {
//     await saveBookings(allBookings);
//   } catch (error) {
//     return c.json({ error: "Could not update booking" }, 500);
//   }
//   return c.json(allBookings[bookingIndex]);
// });

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
