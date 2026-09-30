import { supabase } from "../lib/supabase.js";
import type { NewBooking, Booking } from "../types/booking.js";

export async function getBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}
