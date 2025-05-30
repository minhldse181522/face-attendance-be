import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MaxLength, IsISO8601 } from 'class-validator';

export class CreateUserContractRequestDto {
  @ApiProperty({
    example: 'CONTRACT001',
    description: 'Mã hợp đồng',
  })
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({
    example: 'Hợp đồng lao động',
    description: 'Tiêu đề hợp đồng',
  })
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({
    example: 'Mô tả chi tiết về hợp đồng lao động',
    description: 'Mô tả hợp đồng',
  })
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Thời gian bắt đầu',
  })
  @IsOptional()
  @IsISO8601()
  startTime?: string;

  @ApiPropertyOptional({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Thời gian kết thúc',
  })
  @IsOptional()
  @IsISO8601()
  endTime?: string;

  @ApiPropertyOptional({
    example: '1 năm',
    description: 'Thời hạn hợp đồng',
  })
  @IsOptional()
  @MaxLength(50)
  duration?: string;

  @ApiPropertyOptional({
    example: '/uploads/contracts/contract001.pdf',
    description: 'Đường dẫn đến file PDF hợp đồng',
  })
  @IsOptional()
  @MaxLength(200)
  contractPdf?: string;

  @ApiPropertyOptional({
    example: 'ACTIVE',
    description: 'Trạng thái hợp đồng',
  })
  @IsOptional()
  @MaxLength(50)
  status?: string;

  @ApiPropertyOptional({
    example: 'USER001',
    description: 'Mã người dùng',
  })
  @IsOptional()
  @MaxLength(200)
  userCode?: string;

  @ApiPropertyOptional({
    example: 'BRANCH001',
    description: 'Mã chi nhánh người dùng',
  })
  @IsOptional()
  @MaxLength(200)
  userBranchCode?: string;
}
