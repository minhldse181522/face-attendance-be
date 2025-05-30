import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, MaxLength, IsISO8601 } from 'class-validator';

export class UpdateUserContractRequestDto {
  @ApiPropertyOptional({
    example: 'CONTRACT001',
    description: 'Mã hợp đồng',
  })
  @IsOptional()
  @MaxLength(50)
  code?: string | null;

  @ApiPropertyOptional({
    example: 'Hợp đồng lao động',
    description: 'Tiêu đề hợp đồng',
  })
  @IsOptional()
  @MaxLength(100)
  title?: string | null;

  @ApiPropertyOptional({
    example: 'Mô tả chi tiết về hợp đồng lao động',
    description: 'Mô tả hợp đồng',
  })
  @IsOptional()
  @MaxLength(2000)
  description?: string | null;

  @ApiPropertyOptional({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Thời gian bắt đầu',
  })
  @IsOptional()
  @IsISO8601()
  startTime?: string | null;

  @ApiPropertyOptional({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Thời gian kết thúc',
  })
  @IsOptional()
  @IsISO8601()
  endTime?: string | null;

  @ApiPropertyOptional({
    example: '1 năm',
    description: 'Thời hạn hợp đồng',
  })
  @IsOptional()
  @MaxLength(50)
  duration?: string | null;

  @ApiPropertyOptional({
    example: '/uploads/contracts/contract001.pdf',
    description: 'Đường dẫn đến file PDF hợp đồng',
  })
  @IsOptional()
  @MaxLength(200)
  contractPdf?: string | null;

  @ApiPropertyOptional({
    example: 'ACTIVE',
    description: 'Trạng thái hợp đồng',
  })
  @IsOptional()
  @MaxLength(50)
  status?: string | null;

  @ApiPropertyOptional({
    example: 'USER001',
    description: 'Mã người dùng',
  })
  @IsOptional()
  @MaxLength(200)
  userCode?: string | null;

  @ApiPropertyOptional({
    example: 'BRANCH001',
    description: 'Mã chi nhánh người dùng',
  })
  @IsOptional()
  @MaxLength(200)
  userBranchCode?: string | null;
}
