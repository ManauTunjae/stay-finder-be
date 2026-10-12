import type {
  NewBooking,
  Booking,
  BookingStatus,
  BookingChanges,
} from "../types/booking.js";
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
  booking: NewBooking & { total_price: number },
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

export async function updateBookingStatus(
  supabase: BasicSupabaseClient,
  id: string,
  status: BookingStatus,
): Promise<Booking | null> {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: status })
    .eq("booking_id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function updateBooking(
  supabase: BasicSupabaseClient,
  id: string,
  changes: BookingChanges,
): Promise<Booking | null> {
  const { data, error } = await supabase
    .from("bookings")
    .update(changes)
    .eq("booking_id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

// rpc anropar databasfunktion från Supabase som jag har skapat
export async function hasOverlappingBooking(
  supabase: BasicSupabaseClient,
  propertyId: string,
  checkIn: string,
  checkOut: string,
  excludeBooking?: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_overlapping_booking", {
    p_property_id: propertyId,
    p_check_in: checkIn,
    p_check_out: checkOut,
    p_exclude_booking_id: excludeBooking,
  });
  if (error) {
    throw new Error(error.message);
  }
  return data;
}
