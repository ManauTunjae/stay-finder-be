import { Hono } from "hono";
import fs from "fs/promises";

const bookings = new Hono({ strict: false });

async function getBookings(): Promise<Booking[]> {
  try {
    const data = await fs.readFile("src/data/bookings.json", {
      encoding: "utf8",
    });
    const bookings: Booking[] = JSON.parse(data);
    return bookings;
  } catch (e) {
    console.warn("Error getting bookings from json", e);
    return [];
  }
}

bookings.get("/", async (c) => {
  const allBookings = await getBookings();
  return c.json(allBookings);
});

bookings.get("/:id", async (c) => {
  const allbookings = await getBookings();
  const bookingId = c.req.param("id");
  const booking = allbookings.find((b) => b.booking_id === bookingId);

  if (!booking) {
    return c.json({ error: "Booking not found" }, 404);
  }
  return c.json(booking);
});

export default bookings;
