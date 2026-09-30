import { Hono } from "hono";
import type { NewBooking } from "../types/booking.js";
import * as db from "../database/booking.js";
// import fs from "fs/promises";
import { bookingValidator } from "../validators/bookingValidator.js";
import bookingParamValidator from "../validators/bookingParamValidator.js";
import { preprocess } from "zod";

const bookings = new Hono({ strict: false });

bookings.get("/", async (c) => {
  const allBookings = await db.getBookings();
  return c.json(allBookings);
});

bookings.get("/:id", bookingParamValidator, async (c) => {
  const { id } = c.req.valid("param");
  const booking = await db.getBookingById(id);
  if (!booking) {
    return c.json({ error: "Booking not found" }, 404);
  }
  return c.json(booking);
});

// bookings.post("/", bookingValidator, async (c) => {
//   const allBookings = await getBookings();
//   const bookingBody = c.req.valid("json");

//   const booking: Booking = {
//     ...bookingBody,
//     booking_id: `booking_${allBookings.length + 1}`,
//   };

//   allBookings.push(booking);

//   try {
//     await saveBookings(allBookings);
//   } catch (error) {
//     return c.json({ error: "Could not save booking" }, 500);
//   }
//   return c.json(booking, 201);
// });

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
