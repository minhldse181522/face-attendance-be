import { Injectable } from '@nestjs/common';
import { addDays, endOfMonth, isSameMonth, isWeekend } from 'date-fns';

@Injectable()
export class GenerateWorkingDate {
  async generateWorkingDate(
    startDate: Date,
    option: 'NGAY' | 'TUAN' | 'THANG',
  ): Promise<Date[]> {
    const dates: Date[] = [];

    const addValidDate = (d: Date) => {
      if (!isWeekend(d) && isSameMonth(d, startDate)) {
        dates.push(d);
      }
    };

    if (option === 'NGAY') {
      addValidDate(startDate);
    }

    if (option === 'TUAN') {
      for (let i = 0; i < 7; i++) {
        const next = addDays(startDate, i);
        addValidDate(next);
      }
    }

    if (option === 'THANG') {
      let next = startDate;
      const end = endOfMonth(startDate);
      while (next <= end) {
        addValidDate(next);
        next = addDays(next, 1);
      }
    }

    return dates;
  }
}
