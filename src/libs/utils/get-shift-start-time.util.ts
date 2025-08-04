export function getShiftStartDateTime(
  date: Date,
  shiftStartTime: Date,
  checkinTime?: Date,
): Date {
  // Sử dụng ngày từ checkinTime nếu được cung cấp, nếu không thì dùng date
  const baseDate = checkinTime ? new Date(checkinTime) : new Date(date);
  const shiftStartDateTime = new Date(baseDate);
  shiftStartDateTime.setHours(shiftStartTime.getHours());
  shiftStartDateTime.setMinutes(shiftStartTime.getMinutes());
  shiftStartDateTime.setSeconds(0);
  shiftStartDateTime.setMilliseconds(0);
  return shiftStartDateTime;
}
