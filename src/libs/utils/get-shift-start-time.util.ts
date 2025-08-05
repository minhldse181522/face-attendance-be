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

/**
 * Tạo datetime cho shift start time từ startTime có thể là Date hoặc string
 * @param scheduleDate Ngày của lịch làm việc
 * @param startTime Thời gian bắt đầu ca (có thể là Date hoặc string "HH:mm")
 * @returns Date object với thời gian bắt đầu ca
 */
export function createShiftStartDateTime(
  scheduleDate: Date,
  startTime: Date | string | null,
): Date | null {
  if (!startTime) {
    return null;
  }

  const shiftStartDateTime = new Date(scheduleDate);
  
  let startHour: number, startMinute: number;
  
  if (startTime instanceof Date) {
    startHour = startTime.getUTCHours();
    startMinute = startTime.getUTCMinutes();
  } else if (typeof startTime === 'string') {
    const timeParts = startTime.split(':');
    if (timeParts.length !== 2) {
      return null;
    }
    startHour = parseInt(timeParts[0], 10);
    startMinute = parseInt(timeParts[1], 10);
    
    if (isNaN(startHour) || isNaN(startMinute)) {
      return null;
    }
  } else {
    return null;
  }
  
  shiftStartDateTime.setUTCHours(startHour, startMinute, 0, 0);
  return shiftStartDateTime;
}
