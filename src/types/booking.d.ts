export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface NewBooking {
  property_id: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  guests: number;
  status?: BookingStatus;
}

export interface Booking extends NewBooking {
  booking_id: string;
  guest_id: string;
  status: BookingStatus;
  created_at: string;
}