import { Injectable } from '@nestjs/common';
import { addDays, endOfMonth, format, isSameMonth } from 'date-fns';

@Injectable()
export class GenerateWorkingDate {
  private readonly weekdayMap: Record<string, number> = {
    T2: 1,
    T3: 2,
    T4: 3,
    T5: 4,
    T6: 5,
    T7: 6,
    CN: 0,
  };
  async generateWorkingDate(
    startDate: Date,
    option: 'NGAY' | 'TUAN' | 'THANG',
    holidayMode: string[] = [],
    alreadyGeneratedDates: Date[] = [],
  ): Promise<Date[]> {
    const dates: Date[] = [];
    const realStartDate = new Date(startDate);

    // Danh sách ngày đã tạo trước đó, dưới dạng chuỗi YYYY-MM-DD
    const createdSet = new Set(
      alreadyGeneratedDates.map((d) => format(d, 'yyyy-MM-dd')),
    );

    // Danh sách các weekday cần loại trừ (nếu holidayMode có)
    const holidayWeekdays = holidayMode
      .map((day) => this.weekdayMap[day])
      .filter((d) => d !== undefined);

    const addValidDate = (d: Date) => {
      const weekday = d.getDay();
      const key = format(d, 'yyyy-MM-dd');

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
      for (let i = 0; i < 7; i++) {
        const next = addDays(realStartDate, i);
        addValidDate(next);
      }
    }

    if (option === 'THANG') {
      let next = realStartDate;
      const end = endOfMonth(realStartDate);
      while (next <= end) {
        addValidDate(next);
        next = addDays(next, 1);
      }
    }

    return dates;
  }
}
