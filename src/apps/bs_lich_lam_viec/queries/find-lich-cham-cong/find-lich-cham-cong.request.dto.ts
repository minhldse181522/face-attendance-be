import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { FilterDto } from '@src/libs/application/validators/prisma-filter.validator';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class FindLichChamCongRequestDto extends FilterDto<Prisma.TimeKeepingWhereInput> {
  @ApiProperty({
    example: '',
    description: 'Mã nhân viên',
  })
  @IsNotEmpty()
  @MaxLength(50)
  userCode: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Từ ngày',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: Date;

  @ApiPropertyOptional({
    example: '',
    description: 'Đến ngày',
  })
  @IsOptional()
  @IsDateString()
  toDate?: Date;
}
