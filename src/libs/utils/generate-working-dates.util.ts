import { Injectable } from '@nestjs/common';
import {
  NotGeneratedError,
  ShiftCreatedConflictError,
} from '@src/apps/bs_lich_lam_viec/domain/lich-lam-viec.error';
import { addDays, endOfMonth, endOfWeek, format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

function normalizeDate(date: Date | string): string {
  return format(new Date(date), 'yyyy-MM-dd');
}

function isOverlappingWithExistingShift(
  targetDate: Date,
  newStartTime: string,
  existingShifts: { date: Date; startTime: string; endTime: string }[],
  newEndTime: string,
): boolean {
  const timeZone = 'Asia/Ho_Chi_Minh';

  const normalizeDateOnly = (d: Date) =>
    toZonedTime(d, timeZone).toISOString().split('T')[0];

  const getDateTimeInVN = (date: Date, timeStr: string): Date => {
    const [h, m] = timeStr.split(':').map(Number);
    const zoned = toZonedTime(date, timeZone);
    return new Date(
      zoned.getFullYear(),
      zoned.getMonth(),
      zoned.getDate(),
      h,
      m,
      0,
      0,
    );
  };

  const targetDay = normalizeDateOnly(targetDate);
  const newStart = getDateTimeInVN(targetDate, newStartTime);
  const newEnd = getDateTimeInVN(targetDate, newEndTime);

  return existingShifts.some((shift) => {
    const shiftDay = normalizeDateOnly(shift.date);
    if (shiftDay !== targetDay) return false;

    const existStart = getDateTimeInVN(shift.date, shift.startTime);
    const existEnd = getDateTimeInVN(shift.date, shift.endTime);

    const isOverlap = newStart < existEnd && newEnd > existStart;

    return isOverlap;
  });
}

function isToday(date: Date): boolean {
  const now = toZonedTime(new Date(), 'Asia/Ho_Chi_Minh');
  const zoned = toZonedTime(date, 'Asia/Ho_Chi_Minh');

  return (
    zoned.getFullYear() === now.getFullYear() &&
    zoned.getMonth() === now.getMonth() &&
    zoned.getDate() === now.getDate()
  );
}

function isAfterShiftStartOnDate(date: Date, shiftStartTime: string): boolean {
  const [startHour, startMinute] = shiftStartTime.split(':').map(Number);

  const shiftDateInVN = toZonedTime(date, 'Asia/Ho_Chi_Minh');

  const shiftStart = new Date(shiftDateInVN);
  shiftStart.setHours(startHour, startMinute, 0, 0);

  const now = toZonedTime(new Date(), 'Asia/Ho_Chi_Minh');

  return now >= shiftStart;
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
  ): Promise<Date[]> {
    const dates: Date[] = [];
    const realStartDate = new Date(normalizeDate(startDate));

    let overlapCount = 0;
    let lateStartCount = 0;

    // Danh sách ngày đã tạo trước đó, dưới dạng chuỗi YYYY-MM-DD
    const createdSet = new Set(
      alreadyGeneratedDates.map((d) => normalizeDate(d)),
    );

    // Danh sách các weekday cần loại trừ (nếu holidayMode có)
    const holidayWeekdays = holidayMode
      .map((day) => this.weekdayMap[day])
      .filter((d) => d !== undefined);

    const addValidDate = (d: Date) => {
      const key = normalizeDate(d);
      const weekday = d.getDay();

      const isHoliday = holidayWeekdays.includes(weekday);
      const isLate =
        isToday(d) &&
        shiftStartTime &&
        isAfterShiftStartOnDate(d, shiftStartTime);
      const isOverlap = isOverlappingWithExistingShift(
        d,
        shiftStartTime!,
        alreadyGeneratedShifts,
        shiftEndTimeStr,
      );

      if (!isHoliday && !createdSet.has(key)) {
        if (isLate) {
          lateStartCount++;
          return;
        }
        if (isOverlap) {
          overlapCount++;
          return;
        }

        dates.push(d);
        createdSet.add(key);
      }
    };

    if (option === 'NGAY') {
      addValidDate(realStartDate);
    }

    if (option === 'TUAN') {
      const endOfWeekDate = endOfWeek(new Date(realStartDate), {
        weekStartsOn: 1,
      });
      let current = new Date(realStartDate);
      while (current <= endOfWeekDate) {
        addValidDate(current);
        current = addDays(current, 1);
      }
    }

    if (option === 'THANG') {
      const end = endOfMonth(realStartDate);
      let current = new Date(realStartDate);
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
