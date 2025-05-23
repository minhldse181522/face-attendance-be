import { Prisma } from '@prisma/client';

export interface PositionProps {
  id?: bigint;
  // Add properties here
  code: string;
  roleCode: string;
  positionName: string;
  basicSalary: Prisma.Decimal;
  allowance: Prisma.Decimal;
  overtimeSalary?: Prisma.Decimal | null;
  lateFee?: Prisma.Decimal | null;
  createdBy: string;
  updatedBy?: string | null;
  inUseCount?: number;
}

export interface CreatePositionProps {
  // Add properties here
  code: string;
  roleCode: string;
  positionName: string;
  basicSalary: Prisma.Decimal;
  allowance: Prisma.Decimal;
  overtimeSalary?: Prisma.Decimal | null;
  lateFee?: Prisma.Decimal | null;
  createdBy: string;
}

export interface UpdatePositionProps {
  // Add properties here
  code?: string | null;
  roleCode?: string | null;
  positionName?: string | null;
  basicSalary?: Prisma.Decimal | null;
  allowance?: Prisma.Decimal | null;
  overtimeSalary?: Prisma.Decimal | null;
  lateFee?: Prisma.Decimal | null;
  updatedBy: string | null;
}
