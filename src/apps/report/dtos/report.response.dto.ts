import { ApiProperty } from '@nestjs/swagger';

export class FindReportResponseDto {
  @ApiProperty({
    example: 150,
    description: 'Tổng số nhân viên',
  })
  totalEmployees: number;

  @ApiProperty({
    example: 850000000,
    description: 'Tổng chi phí lương tháng hiện tại (VND)',
  })
  totalSalaryExpense: number;

  @ApiProperty({
    example: 96.7,
    description: 'Tỷ lệ chấm công trong tháng',
  })
  attendanceRate: number;

  @ApiProperty({
    example: 13.6,
    description: 'Tỷ lệ tăng trưởng so với tháng trước (%)',
  })
  growthRate: number;

  @ApiProperty({
    example: 8.97,
    description: 'Tỷ lệ phần trăm đi muộn trong tháng (%)',
  })
  lateTimeRate: number;

  @ApiProperty({
    example: 95.6,
    description: 'Tỷ lệ chấm công trung bình tháng (%)',
  })
  averageAttendanceRate: number;

  @ApiProperty({
    example: 150,
    description: 'Số nhân viên hoạt động',
  })
  activeEmployees: number;
}

export class MonthlyReportDto {
  @ApiProperty({ example: '07/2025', description: 'Tháng báo cáo (MM/YYYY)' })
  month: string;

  @ApiProperty({ type: FindReportResponseDto })
  data: FindReportResponseDto;
}

export class ReportResponseDto {
  @ApiProperty({ type: [MonthlyReportDto] })
  reports: MonthlyReportDto[];

  constructor(partial: Partial<ReportResponseDto>) {
    Object.assign(this, partial);
  }
}
