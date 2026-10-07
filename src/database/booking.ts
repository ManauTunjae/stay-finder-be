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