export interface FindReportParams {
  month?: string;
}

interface MonthlyReportData {
  totalEmployees: number;
  totalSalaryExpense: number;
  attendanceRate: number;
  growthRate: number;
  lateTimeRate: number;
  averageAttendanceRate: number;
  activeEmployees: number;
}

interface MonthlyReport {
  month: string;
  data: MonthlyReportData;
}

export interface FindReportResult {
  reports: MonthlyReport[];
}

export interface EmployeeAttendanceDetail {
  totalWorkDays: number;
  actualWorkDays: number;
  lateDays: number;
  overtimeHours: number;
  totalSalary: number;
  attendanceRate: number;
}

export interface DepartmentReportResult {
  departments: Array<{
    branchCode: string;
    branchName: string;
    totalEmployees: number;
    attendanceRate: number;
    averageSalary: number;
    totalSalaryExpense: number;
  }>;
}

export interface TopPerformersResult {
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
}

export interface YearlyStatisticsResult {
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
}

export interface SalaryDistributionResult {
  salaryRanges: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  averageSalary: number;
  medianSalary: number;
  maxSalary: number;
  minSalary: number;
}

export interface ReportRepositoryPort {
  findReport(params: FindReportParams): Promise<FindReportResult>;
  getEmployeeAttendanceDetail(
    userCode: string,
    month: string,
  ): Promise<EmployeeAttendanceDetail>;
  getDepartmentReport(month: string): Promise<DepartmentReportResult>;
  getTopPerformers(month: string, limit?: number): Promise<TopPerformersResult>;
  getYearlyStatistics(year: string): Promise<YearlyStatisticsResult>;
  getSalaryDistribution(month: string): Promise<SalaryDistributionResult>;
}
