export function calculateNights(checkIn: string, checkOut: string): number{
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  /* slut minus start, i millisekunder */
  const stayDurationInMs = checkOutDate.getTime() - checkInDate.getTime();
  /* millisekunder på ett dygn */
  const msPerDay = 1000 * 60 * 60 * 24;

  return Math.round(stayDurationInMs / msPerDay);
}