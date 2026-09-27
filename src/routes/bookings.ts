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

export default bookings;
