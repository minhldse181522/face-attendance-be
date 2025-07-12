export function getShiftStartDateTime(date: Date, shiftStartTime: Date): Date {
  const shiftStartDateTime = new Date(date);
  shiftStartDateTime.setUTCHours(shiftStartTime.getUTCHours());
  shiftStartDateTime.setUTCMinutes(shiftStartTime.getUTCMinutes());
  shiftStartDateTime.setUTCSeconds(0);
  shiftStartDateTime.setUTCMilliseconds(0);
  return shiftStartDateTime;
}
