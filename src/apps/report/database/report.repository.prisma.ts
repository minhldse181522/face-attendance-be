import { RequestContextService } from '@libs/application/context/AppRequestContext';
import { PrismaClientManager } from '@libs/prisma/prisma-client-manager';
import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import {
  FindReportParams,
  FindReportResult,
  ReportRepositoryPort,
} from './report.repository.port';

@Injectable()
export class ReportRepository implements ReportRepositoryPort {
  protected clients = new Map<string, PrismaClient>();

  constructor(protected readonly clientManager: PrismaClientManager) {}

  async findReport(params: FindReportParams): Promise<FindReportResult> {
    const client = await this._getClient();

    // Lấy danh sách các tháng cần báo cáo
    const months = await this.getReportMonths(client, params.month);

    const reports = await Promise.all(
      months.map(async (month) => {
        const data = await this.calculateMonthlyReport(client, month);
        return {
          month,
          data,
        };
      }),
    );

    return { reports };
  }

  private async getReportMonths(
    client: PrismaClient,
    month?: string,
  ): Promise<string[]> {
    if (month) {
      return [month];
    }

    // Lấy 12 tháng gần nhất từ bảng payroll
    const result = await client.$queryRaw<{ month: string }[]>`
      SELECT DISTINCT month 
      FROM dt_payroll 
      WHERE month IS NOT NULL 
      ORDER BY month DESC 
      LIMIT 12
    `;

    return result.map((r) => r.month);
  }

  private async calculateMonthlyReport(
    client: PrismaClient,
    month: string,
  ): Promise<{
    totalEmployees: number;
    totalSalaryExpense: number;
    attendanceRate: number;
    growthRate: number;
    lateTimeRate: number;
    averageAttendanceRate: number;
    activeEmployees: number;
  }> {
    // 1. Tổng số nhân viên có lương trong tháng
    const totalEmployees = await client.payroll.count({
      where: { month },
    });

    // 2. Tổng chi phí lương
    const salaryResult = await client.payroll.aggregate({
      where: { month },
      _sum: { totalSalary: true },
    });
    const totalSalaryExpense = Number(salaryResult._sum.totalSalary || 0);

    // 3. Tổng số nhân viên đang hoạt động
    const activeEmployees = await client.user.count({
      where: { isActive: true },
    });

    // 4. Tính tỷ lệ chuyên cần từ working schedule và time keeping
    const workingScheduleStats = await this.calculateAttendanceStats(
      client,
      month,
    );

    // 5. Tính tỷ lệ tăng trưởng so với tháng trước
    const growthRate = await this.calculateGrowthRate(client, month);

    return {
      totalEmployees,
      totalSalaryExpense,
      attendanceRate: workingScheduleStats.attendanceRate,
      growthRate,
      lateTimeRate: workingScheduleStats.lateTimeRate,
      averageAttendanceRate: workingScheduleStats.averageAttendanceRate,
      activeEmployees,
    };
  }

  private async calculateAttendanceStats(
    client: PrismaClient,
    month: string,
  ): Promise<{
    attendanceRate: number;
    lateTimeRate: number;
    averageAttendanceRate: number;
  }> {
    // Parse month format (MM/YY)
    const [monthPart, yearPart] = month.split('/');
    const year = yearPart
      ? `20${yearPart}`
      : new Date().getFullYear().toString();
    const monthNumber = parseInt(monthPart, 10);

    // Tạo date range cho tháng
    const startDate = new Date(parseInt(year), monthNumber - 1, 1);
    const endDate = new Date(parseInt(year), monthNumber, 0); // Ngày cuối tháng

    // Tổng số lịch làm việc trong tháng
    const totalSchedules = await client.workingSchedule.count({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Tổng số ca đã hoàn thành (có time keeping)
    const completedSchedules = await client.workingSchedule.count({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        timeKeeping: {
          isNot: null,
        },
      },
    });

    // Tổng số ca đi trễ
    const lateSchedules = await client.timeKeeping.count({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: 'LATE',
      },
    });

    // Tính tỷ lệ
    const attendanceRate =
      totalSchedules > 0 ? (completedSchedules / totalSchedules) * 100 : 0;
    const lateTimeRate =
      completedSchedules > 0 ? (lateSchedules / completedSchedules) * 100 : 0;

    // Tính tỷ lệ chuyên cần trung bình theo từng nhân viên
    const userAttendanceStats = await client.$queryRaw<
      { userCode: string; totalSchedules: number; completedSchedules: number }[]
    >`
      SELECT 
        ws.user_code as "userCode",
        COUNT(ws.id) as "totalSchedules",
        COUNT(tk.id) as "completedSchedules"
      FROM dt_working_schedule ws
      LEFT JOIN dt_time_keeping tk ON ws.code = tk.working_schedule_code
      WHERE ws.date >= ${startDate} AND ws.date <= ${endDate}
      GROUP BY ws.user_code
    `;

    const userAttendanceRates = userAttendanceStats.map((stat) => {
      return stat.totalSchedules > 0
        ? (Number(stat.completedSchedules) / Number(stat.totalSchedules)) * 100
        : 0;
    });

    const averageAttendanceRate =
      userAttendanceRates.length > 0
        ? userAttendanceRates.reduce((sum, rate) => sum + rate, 0) /
          userAttendanceRates.length
        : 0;

    return {
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      lateTimeRate: Math.round(lateTimeRate * 100) / 100,
      averageAttendanceRate: Math.round(averageAttendanceRate * 100) / 100,
    };
  }

  private async calculateGrowthRate(
    client: PrismaClient,
    currentMonth: string,
  ): Promise<number> {
    // Tính tháng trước
    const [monthPart, yearPart] = currentMonth.split('/');
    let prevMonth = parseInt(monthPart, 10) - 1;
    let prevYear = yearPart;

    if (prevMonth === 0) {
      prevMonth = 12;
      const currentYear = parseInt(`20${yearPart}`, 10);
      prevYear = (currentYear - 1).toString().slice(-2);
    }

    const previousMonth = `${prevMonth}/${prevYear}`;

    // Lấy tổng lương tháng hiện tại
    const currentSalary = await client.payroll.aggregate({
      where: { month: currentMonth },
      _sum: { totalSalary: true },
    });

    // Lấy tổng lương tháng trước
    const previousSalary = await client.payroll.aggregate({
      where: { month: previousMonth },
      _sum: { totalSalary: true },
    });

    const currentTotal = Number(currentSalary._sum.totalSalary || 0);
    const previousTotal = Number(previousSalary._sum.totalSalary || 0);

    if (previousTotal === 0) return 0;

    const growthRate = ((currentTotal - previousTotal) / previousTotal) * 100;
    return Math.round(growthRate * 100) / 100;
  }

  // Thêm các phương thức báo cáo bổ sung
  async getEmployeeAttendanceDetail(
    userCode: string,
    month: string,
  ): Promise<{
    totalWorkDays: number;
    actualWorkDays: number;
    lateDays: number;
    overtimeHours: number;
    totalSalary: number;
    attendanceRate: number;
  }> {
    const client = await this._getClient();

    // Parse month format (MM/YY)
    const [monthPart, yearPart] = month.split('/');
    const year = yearPart
      ? `20${yearPart}`
      : new Date().getFullYear().toString();
    const monthNumber = parseInt(monthPart, 10);

    const startDate = new Date(parseInt(year), monthNumber - 1, 1);
    const endDate = new Date(parseInt(year), monthNumber, 0);

    // Tổng số ngày làm việc được lên lịch
    const totalWorkDays = await client.workingSchedule.count({
      where: {
        userCode,
        date: { gte: startDate, lte: endDate },
      },
    });

    // Số ngày thực tế đi làm
    const actualWorkDays = await client.timeKeeping.count({
      where: {
        userCode,
        date: { gte: startDate, lte: endDate },
        status: { in: ['END', 'LATE'] },
      },
    });

    // Số ngày đi trễ
    const lateDays = await client.timeKeeping.count({
      where: {
        userCode,
        date: { gte: startDate, lte: endDate },
        status: 'LATE',
      },
    });

    // Tổng giờ tăng ca (từ bảng payroll)
    const payrollData = await client.payroll.findFirst({
      where: { userCode, month },
      select: {
        totalWorkHour: true,
        totalSalary: true,
      },
    });

    const overtimeHours = Number(payrollData?.totalWorkHour || 0);
    const totalSalary = Number(payrollData?.totalSalary || 0);
    const attendanceRate =
      totalWorkDays > 0 ? (actualWorkDays / totalWorkDays) * 100 : 0;

    return {
      totalWorkDays,
      actualWorkDays,
      lateDays,
      overtimeHours,
      totalSalary,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
    };
  }

  async getDepartmentReport(month: string): Promise<{
    departments: Array<{
      branchCode: string;
      branchName: string;
      totalEmployees: number;
      attendanceRate: number;
      averageSalary: number;
      totalSalaryExpense: number;
    }>;
  }> {
    const client = await this._getClient();

    // Parse month format
    const [monthPart, yearPart] = month.split('/');
    const year = yearPart
      ? `20${yearPart}`
      : new Date().getFullYear().toString();
    const monthNumber = parseInt(monthPart, 10);

    const startDate = new Date(parseInt(year), monthNumber - 1, 1);
    const endDate = new Date(parseInt(year), monthNumber, 0);

    const departmentStats = await client.$queryRaw<
      Array<{
        branchCode: string;
        branchName: string;
        totalEmployees: bigint;
        totalSchedules: bigint;
        completedSchedules: bigint;
        totalSalary: bigint;
      }>
    >`
      SELECT 
        b.code as "branchCode",
        b.branch_name as "branchName",
        COUNT(DISTINCT p.user_code) as "totalEmployees",
        COUNT(DISTINCT ws.id) as "totalSchedules",
        COUNT(DISTINCT tk.id) as "completedSchedules",
        COALESCE(SUM(p.total_salary), 0) as "totalSalary"
      FROM dt_branch b
      LEFT JOIN dt_user u ON u.address_code = b.code
      LEFT JOIN dt_payroll p ON p.user_code = u.code AND p.month = ${month}
      LEFT JOIN dt_working_schedule ws ON ws.user_code = u.code 
        AND ws.date >= ${startDate} AND ws.date <= ${endDate}
      LEFT JOIN dt_time_keeping tk ON tk.working_schedule_code = ws.code
      WHERE b.code IS NOT NULL
      GROUP BY b.code, b.branch_name
      ORDER BY "totalEmployees" DESC
    `;

    return {
      departments: departmentStats.map((dept) => ({
        branchCode: dept.branchCode,
        branchName: dept.branchName,
        totalEmployees: Number(dept.totalEmployees),
        attendanceRate:
          Number(dept.totalSchedules) > 0
            ? Math.round(
                (Number(dept.completedSchedules) /
                  Number(dept.totalSchedules)) *
                  10000,
              ) / 100
            : 0,
        averageSalary:
          Number(dept.totalEmployees) > 0
            ? Math.round(Number(dept.totalSalary) / Number(dept.totalEmployees))
            : 0,
        totalSalaryExpense: Number(dept.totalSalary),
      })),
    };
  }

  async getTopPerformers(
    month: string,
    limit: number = 10,
  ): Promise<{
    topAttendance: Array<{
      userCode: string;
      userName: string;
      attendanceRate: number;
      totalWorkDays: number;
    }>;
    topSalary: Array<{
      userCode: string;
      userName: string;
      totalSalary: number;
      baseSalary: number;
    }>;
  }> {
    const client = await this._getClient();

    // Parse month format
    const [monthPart, yearPart] = month.split('/');
    const year = yearPart
      ? `20${yearPart}`
      : new Date().getFullYear().toString();
    const monthNumber = parseInt(monthPart, 10);

    const startDate = new Date(parseInt(year), monthNumber - 1, 1);
    const endDate = new Date(parseInt(year), monthNumber, 0);

    // Top attendance performers
    const topAttendance = await client.$queryRaw<
      Array<{
        userCode: string;
        userName: string;
        totalSchedules: bigint;
        completedSchedules: bigint;
      }>
    >`
      SELECT 
        u.code as "userCode",
        u.user_name as "userName",
        COUNT(ws.id) as "totalSchedules",
        COUNT(tk.id) as "completedSchedules"
      FROM dt_user u
      LEFT JOIN dt_working_schedule ws ON ws.user_code = u.code 
        AND ws.date >= ${startDate} AND ws.date <= ${endDate}
      LEFT JOIN dt_time_keeping tk ON tk.working_schedule_code = ws.code
      WHERE u.is_active = true
      GROUP BY u.code, u.user_name
      HAVING COUNT(ws.id) > 0
      ORDER BY (CAST(COUNT(tk.id) AS FLOAT) / COUNT(ws.id)) DESC
      LIMIT ${limit}
    `;

    // Top salary performers
    const topSalary = await client.$queryRaw<
      Array<{
        userCode: string;
        userName: string;
        totalSalary: bigint;
        baseSalary: bigint;
      }>
    >`
      SELECT 
        u.code as "userCode",
        u.user_name as "userName",
        p.total_salary as "totalSalary",
        p.base_salary as "baseSalary"
      FROM dt_user u
      INNER JOIN dt_payroll p ON p.user_code = u.code
      WHERE p.month = ${month}
      ORDER BY p.total_salary DESC
      LIMIT ${limit}
    `;

    return {
      topAttendance: topAttendance.map((emp) => ({
        userCode: emp.userCode,
        userName: emp.userName,
        attendanceRate:
          Number(emp.totalSchedules) > 0
            ? Math.round(
                (Number(emp.completedSchedules) / Number(emp.totalSchedules)) *
                  10000,
              ) / 100
            : 0,
        totalWorkDays: Number(emp.totalSchedules),
      })),
      topSalary: topSalary.map((emp) => ({
        userCode: emp.userCode,
        userName: emp.userName,
        totalSalary: Number(emp.totalSalary),
        baseSalary: Number(emp.baseSalary),
      })),
    };
  }

  async getYearlyStatistics(year: string): Promise<{
    totalEmployeesGrowth: number;
    totalSalaryExpenseGrowth: number;
    averageAttendanceRate: number;
    bestPerformingMonth: string;
    worstPerformingMonth: string;
    monthlyTrends: Array<{
      month: string;
      totalEmployees: number;
      totalSalaryExpense: number;
      attendanceRate: number;
    }>;
  }> {
    const client = await this._getClient();

    // Lấy dữ liệu tất cả các tháng trong năm
    const monthlyData = await client.$queryRaw<
      Array<{
        month: string;
        totalEmployees: bigint;
        totalSalaryExpense: bigint;
        totalSchedules: bigint;
        completedSchedules: bigint;
      }>
    >`
      SELECT 
        p.month,
        COUNT(DISTINCT p.user_code) as "totalEmployees",
        COALESCE(SUM(p.total_salary), 0) as "totalSalaryExpense",
        COUNT(DISTINCT ws.id) as "totalSchedules",
        COUNT(DISTINCT tk.id) as "completedSchedules"
      FROM dt_payroll p
      LEFT JOIN dt_working_schedule ws ON ws.user_code = p.user_code
      LEFT JOIN dt_time_keeping tk ON tk.working_schedule_code = ws.code
      WHERE p.month LIKE ${`%/${year.slice(-2)}`}
      GROUP BY p.month
      ORDER BY p.month
    `;

    if (monthlyData.length === 0) {
      return {
        totalEmployeesGrowth: 0,
        totalSalaryExpenseGrowth: 0,
        averageAttendanceRate: 0,
        bestPerformingMonth: '',
        worstPerformingMonth: '',
        monthlyTrends: [],
      };
    }

    // Tính các xu hướng
    const monthlyTrends = monthlyData.map((data) => ({
      month: data.month,
      totalEmployees: Number(data.totalEmployees),
      totalSalaryExpense: Number(data.totalSalaryExpense),
      attendanceRate:
        Number(data.totalSchedules) > 0
          ? Math.round(
              (Number(data.completedSchedules) / Number(data.totalSchedules)) *
                10000,
            ) / 100
          : 0,
    }));

    // Tính tốc độ tăng trưởng
    const firstMonth = monthlyTrends[0];
    const lastMonth = monthlyTrends[monthlyTrends.length - 1];

    const totalEmployeesGrowth =
      firstMonth.totalEmployees > 0
        ? ((lastMonth.totalEmployees - firstMonth.totalEmployees) /
            firstMonth.totalEmployees) *
          100
        : 0;

    const totalSalaryExpenseGrowth =
      firstMonth.totalSalaryExpense > 0
        ? ((lastMonth.totalSalaryExpense - firstMonth.totalSalaryExpense) /
            firstMonth.totalSalaryExpense) *
          100
        : 0;

    // Tìm tháng có hiệu suất tốt nhất và tệ nhất
    const sortedByAttendance = [...monthlyTrends].sort(
      (a, b) => b.attendanceRate - a.attendanceRate,
    );
    const bestPerformingMonth = sortedByAttendance[0]?.month || '';
    const worstPerformingMonth =
      sortedByAttendance[sortedByAttendance.length - 1]?.month || '';

    // Tính tỷ lệ chuyên cần trung bình
    const averageAttendanceRate =
      monthlyTrends.length > 0
        ? monthlyTrends.reduce((sum, data) => sum + data.attendanceRate, 0) /
          monthlyTrends.length
        : 0;

    return {
      totalEmployeesGrowth: Math.round(totalEmployeesGrowth * 100) / 100,
      totalSalaryExpenseGrowth:
        Math.round(totalSalaryExpenseGrowth * 100) / 100,
      averageAttendanceRate: Math.round(averageAttendanceRate * 100) / 100,
      bestPerformingMonth,
      worstPerformingMonth,
      monthlyTrends,
    };
  }

  async getSalaryDistribution(month: string): Promise<{
    salaryRanges: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
    averageSalary: number;
    medianSalary: number;
    maxSalary: number;
    minSalary: number;
  }> {
    const client = await this._getClient();

    // Lấy tất cả lương trong tháng
    const salaries = await client.payroll.findMany({
      where: { month },
      select: { totalSalary: true },
      orderBy: { totalSalary: 'asc' },
    });

    if (salaries.length === 0) {
      return {
        salaryRanges: [],
        averageSalary: 0,
        medianSalary: 0,
        maxSalary: 0,
        minSalary: 0,
      };
    }

    const salaryValues = salaries.map((s) => Number(s.totalSalary));
    const totalCount = salaryValues.length;

    // Tính các thống kê cơ bản
    const averageSalary =
      salaryValues.reduce((sum, val) => sum + val, 0) / totalCount;
    const medianSalary =
      totalCount % 2 === 0
        ? (salaryValues[Math.floor(totalCount / 2) - 1] +
            salaryValues[Math.floor(totalCount / 2)]) /
          2
        : salaryValues[Math.floor(totalCount / 2)];
    const maxSalary = Math.max(...salaryValues);
    const minSalary = Math.min(...salaryValues);

    // Định nghĩa các khoảng lương
    const ranges = [
      { range: '< 5M', min: 0, max: 5000000 },
      { range: '5M - 10M', min: 5000000, max: 10000000 },
      { range: '10M - 15M', min: 10000000, max: 15000000 },
      { range: '15M - 20M', min: 15000000, max: 20000000 },
      { range: '20M - 30M', min: 20000000, max: 30000000 },
      { range: '> 30M', min: 30000000, max: Infinity },
    ];

    const salaryRanges = ranges.map((range) => {
      const count = salaryValues.filter(
        (salary) => salary >= range.min && salary < range.max,
      ).length;

      return {
        range: range.range,
        count,
        percentage:
          totalCount > 0 ? Math.round((count / totalCount) * 10000) / 100 : 0,
      };
    });

    return {
      salaryRanges,
      averageSalary: Math.round(averageSalary),
      medianSalary: Math.round(medianSalary),
      maxSalary: Math.round(maxSalary),
      minSalary: Math.round(minSalary),
    };
  }

  /*============================================================================================*/
  protected async _getClient(): Promise<PrismaClient> {
    const tenantId = RequestContextService.getTenantId() ?? '';

    let client = this.clients.get(tenantId);
    if (!client) {
      client = this.clientManager.getClient(tenantId);
      this.clients.set(tenantId, client);
    }

    return client;
  }
}
