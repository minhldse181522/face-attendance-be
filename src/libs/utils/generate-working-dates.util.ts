import { Injectable } from '@nestjs/common';
import {
  NotGeneratedError,
  ShiftCreatedConflictError,
} from '@src/apps/bs_lich_lam_viec/domain/lich-lam-viec.error';
import { addDays, endOfMonth, endOfWeek, format } from 'date-fns';

function normalizeDate(date: Date | string): string {
  // Format date in UTC timezone
  const d = new Date(date);
  return (
    d.getUTCFullYear() +
    '-' +
    String(d.getUTCMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getUTCDate()).padStart(2, '0')
  );
}

function createDateInUTC(dateStr: string): Date {
  // Create a date in UTC timezone
  const utcDate = new Date(dateStr + 'T00:00:00.000Z');
  console.log('>>> createDateInUTC:', {
    input: dateStr,
    output: utcDate.toISOString(),
  });
  return utcDate;
}

function convertTodayDateToUTCMinus7(date: Date): Date {
  // Chuyển ngày về đầu ngày UTC, sau đó trừ đi 7 tiếng
  // Ví dụ: 2025-08-04 09:27:03+00 → 2025-08-03 17:00:00+00
  const dateStr = normalizeDate(date); // Get YYYY-MM-DD format
  const startOfDayUTC = new Date(dateStr + 'T00:00:00.000Z'); // Start of day in UTC
  const utcMinus7 = new Date(startOfDayUTC.getTime() - 7 * 60 * 60 * 1000); // Subtract 7 hours

  console.log('>>> convertTodayDateToUTCMinus7:', {
    input: date.toISOString(),
    dateStr: dateStr,
    startOfDayUTC: startOfDayUTC.toISOString(),
    utcMinus7: utcMinus7.toISOString(),
  });

  return utcMinus7;
}

function isOverlappingWithExistingShift(
  date: Date,
  startTime: string,
  endTime: string,
  existingShifts: { date: Date; startTime: string; endTime: string }[],
): boolean {
  const dateStr = normalizeDate(date); // 'yyyy-MM-dd'
  console.log('>>> Checking overlap for date:', dateStr);
  console.log('>>> New shift time:', { startTime, endTime });
  console.log('>>> Existing shifts to check:', existingShifts.length);

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const newStart = new Date(date);
  const newEnd = new Date(date);
  // Use UTC methods to be consistent
  newStart.setUTCHours(startHour, startMinute, 0, 0);
  newEnd.setUTCHours(endHour, endMinute, 0, 0);

  for (const shift of existingShifts) {
    // Check if both dates represent the same logical day in the deployment timezone
    // For deployment environment, we need to compare the actual date regardless of timezone conversion
    const existingShiftDateStr = normalizeDate(shift.date);
    console.log('>>> Existing shift original date:', shift.date.toISOString());
    console.log('>>> Existing shift dateStr:', existingShiftDateStr);

    // For deployment environment, check if the dates are the same logical day
    // This handles cases where UTC conversion might change the date
    const isSameLogicalDay =
      dateStr === existingShiftDateStr ||
      normalizeDate(convertTodayDateToUTCMinus7(shift.date)) === dateStr;

    console.log('>>> Date comparison:', {
      newDate: dateStr,
      existingDate: existingShiftDateStr,
      existingDateUTCMinus7: normalizeDate(
        convertTodayDateToUTCMinus7(shift.date),
      ),
      isSameLogicalDay,
    });

    if (!isSameLogicalDay) {
      console.log('>>> Skipping shift - different date');
      continue;
    }

    const [existStartHour, existStartMinute] = shift.startTime
      .split(':')
      .map(Number);
    const [existEndHour, existEndMinute] = shift.endTime.split(':').map(Number);

    // Use the same base date for time comparison
    const existStart = new Date(date);
    const existEnd = new Date(date);
    // Use UTC methods to be consistent
    existStart.setUTCHours(existStartHour, existStartMinute, 0, 0);
    existEnd.setUTCHours(existEndHour, existEndMinute, 0, 0);

    const isOverlap = newStart < existEnd && existStart < newEnd;

    console.log('>>> Overlap check details:', {
      newStart: newStart.toISOString(),
      newEnd: newEnd.toISOString(),
      existStart: existStart.toISOString(),
      existEnd: existEnd.toISOString(),
      isOverlap,
    });

    if (isOverlap) {
      console.log('[Overlap Detected]', {
        newStart: newStart.toISOString(),
        newEnd: newEnd.toISOString(),
        existStart: existStart.toISOString(),
        existEnd: existEnd.toISOString(),
        isOverlap,
      });
      console.log('[Overlap Detected - BLOCKING CREATION]');
      return true;
    }
  }
  console.log('>>> No overlap found');
  return false;
}

function isToday(date: Date): boolean {
  const now = new Date();
  const targetDate = new Date(date);

  // Compare date strings in UTC to avoid time component issues
  const nowDateStr =
    now.getUTCFullYear() +
    '-' +
    String(now.getUTCMonth() + 1).padStart(2, '0') +
    '-' +
    String(now.getUTCDate()).padStart(2, '0');
  const targetDateStr =
    targetDate.getUTCFullYear() +
    '-' +
    String(targetDate.getUTCMonth() + 1).padStart(2, '0') +
    '-' +
    String(targetDate.getUTCDate()).padStart(2, '0');

  return nowDateStr === targetDateStr;
}

function isAfterShiftStartOnDate(date: Date, startTimeStr: string): boolean {
  const now = new Date();
  const targetDate = new Date(date);

  // Create shift start time for the target date in UTC
  const [startHour, startMinute] = startTimeStr.split(':').map(Number);
  const shiftStart = new Date(targetDate);
  shiftStart.setUTCHours(startHour, startMinute, 0, 0);

  console.log('[Check Late]', {
    now: now.toISOString(),
    nowTime: `${now.getUTCHours()}:${now.getUTCMinutes().toString().padStart(2, '0')}`,
    shiftStart: shiftStart.toISOString(),
    shiftTime: startTimeStr,
    isAfter: now.getTime() > shiftStart.getTime(),
  });

  return now.getTime() > shiftStart.getTime();
}

@Injectable()
export class GenerateWorkingDate {
  private readonly weekdayMap: Record<string, number> = {
    CN: 0,
    T2: 1,
    T3: 2,
    T4: 3,
    T5: 4,
    T6: 5,
    T7: 6,
  };

  // Kiểm tra overlap chỉ giữa các ca, không quan tâm đến ngày
  private isOverlappingShiftsOnly(
    startTime: string,
    endTime: string,
    existingShifts: { date: Date; startTime: string; endTime: string }[],
  ): boolean {
    console.log('>>> Checking shift overlap only (ignoring date)');
    console.log('>>> New shift time:', { startTime, endTime });
    console.log('>>> Existing shifts to check:', existingShifts.length);

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Tạo thời gian cho ca mới (sử dụng ngày tham chiếu)
    const referenceDate = new Date('2024-01-01T00:00:00.000Z');
    const newStart = new Date(referenceDate);
    const newEnd = new Date(referenceDate);
    newStart.setUTCHours(startHour, startMinute, 0, 0);
    newEnd.setUTCHours(endHour, endMinute, 0, 0);

    for (const shift of existingShifts) {
      const [existStartHour, existStartMinute] = shift.startTime
        .split(':')
        .map(Number);
      const [existEndHour, existEndMinute] = shift.endTime
        .split(':')
        .map(Number);

      // Tạo thời gian cho ca đã tồn tại (sử dụng cùng ngày tham chiếu)
      const existStart = new Date(referenceDate);
      const existEnd = new Date(referenceDate);
      existStart.setUTCHours(existStartHour, existStartMinute, 0, 0);
      existEnd.setUTCHours(existEndHour, existEndMinute, 0, 0);

      const isOverlap = newStart < existEnd && existStart < newEnd;

      console.log('>>> Shift overlap check details:', {
        newStart: `${startHour}:${startMinute.toString().padStart(2, '0')}`,
        newEnd: `${endHour}:${endMinute.toString().padStart(2, '0')}`,
        existStart: `${existStartHour}:${existStartMinute.toString().padStart(2, '0')}`,
        existEnd: `${existEndHour}:${existEndMinute.toString().padStart(2, '0')}`,
        isOverlap,
      });

      if (isOverlap) {
        console.log('[Shift Overlap Detected]', {
          newStart: `${startHour}:${startMinute.toString().padStart(2, '0')}`,
          newEnd: `${endHour}:${endMinute.toString().padStart(2, '0')}`,
          existStart: `${existStartHour}:${existStartMinute.toString().padStart(2, '0')}`,
          existEnd: `${existEndHour}:${existEndMinute.toString().padStart(2, '0')}`,
          isOverlap,
        });
        console.log('[Shift Overlap Detected - BLOCKING CREATION]');
        return true;
      }
    }
    console.log('>>> No shift overlap found');
    return false;
  }
  async generateWorkingDate(
    startDate: Date,
    option: 'NGAY' | 'TUAN' | 'THANG',
    holidayMode: string[] = [],
    alreadyGeneratedDates: Date[] = [],
    shiftEndTimeStr: string,
    shiftStartTime?: string,
    alreadyGeneratedShifts: {
      date: Date;
      startTime: string;
      endTime: string;
    }[] = [],
    isTodayFromFE?: boolean,
  ): Promise<Date[]> {
    console.log('Generated shifts', alreadyGeneratedShifts);

    const dates: Date[] = [];
    console.log(dates);

    // Ensure the start date is properly normalized to UTC
    console.log('Input startDate:', startDate);
    console.log('Type of startDate:', typeof startDate);
    console.log('Is startDate a Date?', startDate instanceof Date);

    const realStartDate = new Date(startDate);
    console.log('>>> realStartDate:', realStartDate);
    console.log('>>> realStartDate valid?', !isNaN(realStartDate.getTime()));

    let overlapCount = 0;
    let lateStartCount = 0;

    // Danh sách ngày đã tạo trước đó, dưới dạng chuỗi YYYY-MM-DD
    const createdSet = new Set(
      alreadyGeneratedDates.map((d) => normalizeDate(d)),
    );
    console.log(createdSet);

    // Danh sách các weekday cần loại trừ (nếu holidayMode có)
    const holidayWeekdays = holidayMode
      .map((day) => this.weekdayMap[day])
      .filter((d) => d !== undefined);

    const addValidDate = (d: Date) => {
      const key = normalizeDate(d);
      console.log('Input date d:', d);
      console.log('Type of d:', typeof d);
      console.log('Is d a Date?', d instanceof Date);
      console.log('Is d valid?', d && !isNaN(d.getTime()));
      console.log(key);

      // Kiểm tra xem d có phải là Date object hợp lệ không
      if (!d || !(d instanceof Date) || isNaN(d.getTime())) {
        console.error('Invalid date object:', d);
        return;
      }

      const weekday = d.getDay();
      console.log('weekday', weekday);

      const isHoliday = holidayWeekdays.includes(weekday);
      console.log('ABC');

      // Cho option NGAY: sử dụng isTodayFromFE
      // Cho option TUAN/THANG: kiểm tra từng ngày xem có phải hôm nay thực tế không
      let isTodayDate: boolean;
      if (option === 'NGAY') {
        isTodayDate = isTodayFromFE === true;
        console.log('isTodayDate from FE (NGAY):', isTodayDate);
      } else {
        isTodayDate = isToday(d);
        console.log('isTodayDate calculated (TUAN/THANG):', isTodayDate);
      }

      console.log('--- Check date ---');
      console.log('Date:', d);
      console.log('Is today:', isTodayDate);
      console.log('Shift start time:', shiftStartTime);
      console.log('Is holiday:', isHoliday);
      console.log('Already exists in createdSet:', createdSet.has(key));
      console.log('CreatedSet contents:', Array.from(createdSet));

      // Chỉ kiểm tra holiday, không kiểm tra đã tồn tại ngày
      // Vì có thể tạo nhiều shift trong 1 ngày, chỉ cần không overlap
      if (!isHoliday) {
        console.log('>>> Passed initial checks, proceeding...');

        // Với isTodayFromFE = true, không cần chuẩn hóa ngày vì chỉ check overlap giữa các ca
        const normalizedDate = d;
        console.log(
          '>>> Using original date (no normalization needed for isTodayFromFE):',
          normalizedDate.toISOString(),
        );

        // Case 1: Nếu isTodayDate = true (hôm nay) - chỉ kiểm tra ca với ca, không kiểm tra ngày
        if (isTodayDate) {
          console.log('>>> Processing today case (isTodayDate = true)');
          const isLate =
            shiftStartTime && isAfterShiftStartOnDate(d, shiftStartTime);
          console.log('isLate (today):', isLate);

          if (isLate) {
            console.log('>>> Rejected due to late start');
            lateStartCount++;
            return;
          }

          // Với isTodayFromFE = true, chỉ kiểm tra overlap giữa các ca, không quan tâm ngày
          console.log('>>> Checking shift overlap only (ignoring date)');
          const isOverlap = this.isOverlappingShiftsOnly(
            shiftStartTime!,
            shiftEndTimeStr,
            alreadyGeneratedShifts,
          );
          console.log('isOverlap (today, shift only):', isOverlap);

          if (isOverlap) {
            console.log('>>> Rejected due to shift overlap');
            overlapCount++;
            return;
          }
        }
        // Case 2: Nếu isTodayDate = false (tương lai hoặc quá khứ) - kiểm tra cả ngày và ca
        else {
          console.log('>>> Processing non-today case (isTodayDate = false)');
          const isOverlap = isOverlappingWithExistingShift(
            normalizedDate, // Sử dụng ngày chuẩn hóa
            shiftStartTime!,
            shiftEndTimeStr,
            alreadyGeneratedShifts,
          );
          console.log('isOverlap (future/past):', isOverlap);

          if (isOverlap) {
            console.log('>>> Rejected due to overlap');
            overlapCount++;
            return;
          }
        }

        // Nếu pass tất cả kiểm tra thì thêm vào danh sách
        console.log('>>> Successfully passed all checks, adding date');

        let dateToAdd: Date;
        if (option === 'NGAY') {
          // Option NGAY: xử lý như cũ
          if (isTodayDate) {
            // Với isTodayFromFE = true, giữ nguyên ngày từ FE, không convert về UTC-7
            dateToAdd = d;
            console.log(
              '>>> Using original date from FE for today (NGAY):',
              dateToAdd.toISOString(),
            );
          } else {
            // Nếu không phải hôm nay, giữ nguyên thời gian từ FE
            dateToAdd = d;
            console.log(
              '>>> Using original date from FE (NGAY):',
              dateToAdd.toISOString(),
            );
          }
        } else {
          // Option TUAN/THANG: tất cả ngày đều convert về UTC-7
          dateToAdd = convertTodayDateToUTCMinus7(d);
          console.log(
            '>>> Using UTC-7 converted date for TUAN/THANG:',
            dateToAdd.toISOString(),
          );
        }

        dates.push(dateToAdd);
        // Không cần add vào createdSet nữa vì cho phép nhiều shift/ngày
      }
    };

    if (option === 'NGAY') {
      addValidDate(realStartDate);
    }

    if (option === 'TUAN') {
      // Work with normalized date strings to avoid timezone issues
      const startDateStr = normalizeDate(realStartDate);
      const startDateForCalc = createDateInUTC(startDateStr);
      const endOfWeekDate = endOfWeek(startDateForCalc, {
        weekStartsOn: 1,
      });

      let current = startDateForCalc;
      while (current <= endOfWeekDate) {
        console.log('>>> TUAN - Checking date:', current.toISOString());
        addValidDate(current);
        current = addDays(current, 1);
      }
    }

    if (option === 'THANG') {
      // Work with normalized date strings to avoid timezone issues
      const startDateStr = normalizeDate(realStartDate);
      const startDateForCalc = createDateInUTC(startDateStr);
      const end = endOfMonth(startDateForCalc);

      let current = startDateForCalc;
      while (current <= end) {
        addValidDate(current);
        current = addDays(current, 1);
      }
    }

    if (dates.length === 0) {
      if (overlapCount > 0) {
        throw new ShiftCreatedConflictError();
      }
      throw new NotGeneratedError();
    }

    return dates;
  }
}
