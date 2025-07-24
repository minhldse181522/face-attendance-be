export function getShiftStartDateTime(date: Date, shiftStartTime: Date): Date {
  const shiftStartDateTime = new Date(date);
  shiftStartDateTime.setHours(shiftStartTime.getHours());
  shiftStartDateTime.setMinutes(shiftStartTime.getMinutes());
  shiftStartDateTime.setSeconds(0);
  shiftStartDateTime.setMilliseconds(0);
  return shiftStartDateTime;
}
