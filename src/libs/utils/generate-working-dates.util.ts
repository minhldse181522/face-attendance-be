import { Injectable } from '@nestjs/common';
import { NotGeneratedError } from '@src/apps/bs_lich_lam_viec/domain/lich-lam-viec.error';
import { addDays, endOfMonth, endOfWeek, format } from 'date-fns';

function normalizeDate(date: Date | string): string {
  return format(new Date(date), 'yyyy-MM-dd');
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function isAfterShiftStart(shiftStartTime: string): boolean {
  const [startHour, startMinute] = shiftStartTime.split(':').map(Number);
  const now = new Date();
  return (
    now.getHours() > startHour ||
    (now.getHours() === startHour && now.getMinutes() >= startMinute)
  );
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
    shiftStartTime?: string,
  ): Promise<Date[]> {
    const dates: Date[] = [];
    const realStartDate = new Date(normalizeDate(startDate));

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

      // Nếu chưa được tạo và không nằm trong ngày nghỉ
      if (
        !createdSet.has(key) &&
        !holidayWeekdays.includes(weekday) &&
        !(isToday(d) && shiftStartTime && isAfterShiftStart(shiftStartTime))
      ) {
        dates.push(d);
        createdSet.add(key); // đánh dấu là đã tạo
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
      throw new NotGeneratedError();
    }

    return dates;
  }
}
