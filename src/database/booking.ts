import type { NewBooking, Booking } from "../types/booking.js";
import type { BasicSupabaseClient } from "../types/supabase.js";

export async function getBookings(
  supabase: BasicSupabaseClient,
): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function getBookingById(
  supabase: BasicSupabaseClient,
  id: string,
): Promise<Booking | null> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function createBooking(
  supabase: BasicSupabaseClient,
  booking: NewBooking,
  guestId: string,
): Promise<Booking> {
  const { data, error } = await supabase
    .from("bookings")
    .insert({ ...booking, guest_id: guestId })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Booking could not be created");
  }
  return data;
}

export function calculateNights(checkIn: string, checkOut: string): number{
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  /* slut minus start, i millisekunder */
  const diffInMs = end.getTime() - start.getTime();
  /* millisekunder på ett dygn */
  const msPerDay = 1000 * 60 * 60 * 24;

  return Math.round(diffInMs / msPerDay);
}