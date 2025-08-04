import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLichLamViecRequestDto {
  @ApiProperty({
    example: 'USERCODE001',
    description: 'Mã nhân viên',
  })
  @IsNotEmpty()
  @MaxLength(200)
  userCode: string;

  @ApiProperty({
    example: new Date(),
    description: 'Ngày',
  })
  @IsNotEmpty()
  date: Date;

  @ApiProperty({
    example: 'SHIFT001',
    description: 'Mã ca làm',
  })
  @IsNotEmpty()
  @MaxLength(50)
  shiftCode: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Có phải hôm nay không',
  })
  @IsOptional()
  isToday?: boolean;

  @ApiProperty({
    example: 'SHIFT001',
    description: 'Mã ca làm',
  })
  @IsNotEmpty()
  @MaxLength(50)
  branchCode: string;

  @ApiProperty({
    enum: ['NGAY', 'TUAN', 'THANG'],
    example: 'NGAY',
  })
  @IsNotEmpty()
  @IsEnum(['NGAY', 'TUAN', 'THANG'])
  optionCreate: 'NGAY' | 'TUAN' | 'THANG';

  @ApiPropertyOptional({
    example: '[T2, T3, T4, T5, T6, T7, CN]',
    description: 'Ngày nghỉ',
  })
  @IsOptional()
  @IsArray()
  holidayMode?: string[];
}
