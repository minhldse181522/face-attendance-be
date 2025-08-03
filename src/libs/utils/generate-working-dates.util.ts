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
  date: Date,
  startTime: string,
  endTime: string,
  existingShifts: { date: Date; startTime: string; endTime: string }[],
): boolean {
  const dateStr = normalizeDate(date); // 'yyyy-MM-dd'
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const newStart = new Date(date);
  const newEnd = new Date(date);
  newStart.setHours(startHour, startMinute, 0, 0);
  newEnd.setHours(endHour, endMinute, 0, 0);

  for (const shift of existingShifts) {
    const shiftDay = normalizeDate(shift.date);
    if (shiftDay !== dateStr) continue;

    const [existStartHour, existStartMinute] = shift.startTime
      .split(':')
      .map(Number);
    const [existEndHour, existEndMinute] = shift.endTime.split(':').map(Number);

    const existStart = new Date(shift.date);
    const existEnd = new Date(shift.date);
    existStart.setHours(existStartHour, existStartMinute, 0, 0);
    existEnd.setHours(existEndHour, existEndMinute, 0, 0);

    const isOverlap = newStart < existEnd && existStart < newEnd;

    if (isOverlap) {
      console.log('[Overlap Detected]', {
        newStart,
        newEnd,
        existStart,
        existEnd,
        isOverlap,
      });
      return true;
    }
  }

  return false;
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

function isAfterShiftStartOnDate(date: Date, startTimeStr: string): boolean {
  const timeZone = 'Asia/Ho_Chi_Minh';
  const now = toZonedTime(new Date(), timeZone);
  const targetZoned = toZonedTime(date, timeZone);

  // Tạo thời gian bắt đầu shift trong ngày đó
  const [startHour, startMinute] = startTimeStr.split(':').map(Number);
  const shiftStart = new Date(targetZoned);
  shiftStart.setHours(startHour, startMinute, 0, 0);

  // Convert về VN timezone
  const shiftStartVN = toZonedTime(shiftStart, timeZone);

  console.log('[Check Late]', {
    now: now.toString(),
    nowTime: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`,
    shiftStart: shiftStartVN.toString(),
    shiftTime: startTimeStr,
    isAfter: now.getTime() > shiftStartVN.getTime(),
  });

  return now.getTime() > shiftStartVN.getTime();
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
    console.log('Generated shifts', alreadyGeneratedShifts);

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
      const isTodayDate = isToday(d);

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
        // Case 1: Nếu tạo lịch trong ngày hôm nay
        if (isTodayDate) {
          console.log('>>> Processing today case');
          const isLate =
            shiftStartTime && isAfterShiftStartOnDate(d, shiftStartTime);
          console.log('isLate (today):', isLate);

          if (isLate) {
            console.log('>>> Rejected due to late start');
            lateStartCount++;
            return;
          }

          // Nếu hôm nay nhưng chưa quá giờ, vẫn cần kiểm tra overlap
          console.log('>>> Checking overlap for today');
          const isOverlap = isOverlappingWithExistingShift(
            d,
            shiftStartTime!,
            shiftEndTimeStr,
            alreadyGeneratedShifts,
          );
          console.log('isOverlap (today but not late):', isOverlap);

          if (isOverlap) {
            console.log('>>> Rejected due to overlap');
            overlapCount++;
            return;
          }
        }
        // Case 2: Nếu tạo lịch tương lai - chỉ kiểm tra overlap
        else {
          const isOverlap = isOverlappingWithExistingShift(
            d,
            shiftStartTime!,
            shiftEndTimeStr,
            alreadyGeneratedShifts,
          );
          console.log('isOverlap (future):', isOverlap);

          if (isOverlap) {
            overlapCount++;
            return;
          }
        }

        // Nếu pass tất cả kiểm tra thì thêm vào danh sách
        console.log('>>> Successfully passed all checks, adding date');
        dates.push(d);
        // Không cần add vào createdSet nữa vì cho phép nhiều shift/ngày
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
