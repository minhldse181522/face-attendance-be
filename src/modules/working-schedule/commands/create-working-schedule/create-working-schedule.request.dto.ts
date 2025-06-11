import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, MaxLength } from 'class-validator';

export class CreateWorkingScheduleRequestDto {
  @ApiPropertyOptional({
    example: '',
    description: 'Mã nhân viên',
  })
  @IsOptional()
  @MaxLength(100)
  userCode?: string | null;

  @ApiPropertyOptional({
    example: '',
    description: 'Mã hợp đồng',
  })
  @IsOptional()
  @MaxLength(2000)
  userContractCode?: string | null;

  @ApiPropertyOptional({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Thời gian bắt đầu',
  })
  @IsOptional()
  @IsDateString()
  date?: Date | null;

  @ApiPropertyOptional({
    example: '',
    description: 'Mã ca làm',
  })
  @IsOptional()
  @MaxLength(50)
  shiftCode?: string | null;

  @ApiPropertyOptional({
    example: '',
    description: 'Trạng thái',
  })
  @IsOptional()
  @MaxLength(50)
  status?: string | null;

  @ApiPropertyOptional({
    example: '',
    description: 'Mã chi nhánh',
  })
  @IsOptional()
  @MaxLength(50)
  branchCode?: string | null;
}
