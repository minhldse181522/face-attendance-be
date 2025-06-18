import { Injectable } from '@nestjs/common';
import { addDays, endOfMonth, endOfWeek, format, isSameMonth } from 'date-fns';

function normalizeDate(date: Date | string): string {
  return format(new Date(date), 'yyyy-MM-dd');
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
      if (!createdSet.has(key) && !holidayWeekdays.includes(weekday)) {
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

    return dates;
  }
}
