import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { FilterDto } from '@src/libs/application/validators/prisma-filter.validator';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class FindLichLamViecRequestDto extends FilterDto<Prisma.WorkingScheduleWhereInput> {
  @ApiProperty({
    example: '',
    description: 'Từ ngày',
  })
  @IsNotEmpty()
  @IsDateString()
  fromDate: Date;

  @ApiProperty({
    example: '',
    description: 'Đến ngày',
  })
  @IsNotEmpty()
  @IsDateString()
  toDate: Date;

  @ApiPropertyOptional({
    example: '',
    description: 'Mã nhân viên',
  })
  @IsOptional()
  @MaxLength(50)
  userCode?: string;
}
