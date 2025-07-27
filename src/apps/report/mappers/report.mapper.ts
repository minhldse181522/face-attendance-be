import { Injectable } from '@nestjs/common';
import { FindReportResponseDto, MonthlyReportDto, ReportResponseDto } from '../dtos/report.response.dto';

@Injectable()
export class ReportMapper {
  toFindReportResponse(raw: any): FindReportResponseDto {
    const dto = new FindReportResponseDto();
    dto.totalEmployees = raw.totalEmployees;
    dto.totalSalaryExpense = raw.totalSalaryExpense;
    dto.attendanceRate = raw.attendanceRate;
    dto.growthRate = raw.growthRate;
    dto.lateTimeRate = raw.lateTimeRate;
    dto.averageAttendanceRate = raw.averageAttendanceRate;
    dto.activeEmployees = raw.activeEmployees;
    return dto;
  }

  toMonthlyReport(raw: any): MonthlyReportDto {
    const dto = new MonthlyReportDto();
    dto.month = raw.month;
    dto.data = this.toFindReportResponse(raw);
    return dto;
  }

  toReportResponse(raws: any[]): ReportResponseDto {
    const reports = raws.map((raw) => this.toMonthlyReport(raw));
    return new ReportResponseDto({ reports });
  }
}
