import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateUserContractRequestDto {
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
  description?: string | null;

  @ApiPropertyOptional({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Thời gian bắt đầu',
  })
  @IsOptional()
  @IsDateString()
  startTime?: string | null;

  @ApiPropertyOptional({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Thời gian kết thúc',
  })
  @IsOptional()
  @IsDateString()
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
    example: 'admin',
    description: 'Người quản lý (userCode)',
  })
  @IsOptional()
  @MaxLength(50)
  managedBy?: string | null;

  @ApiPropertyOptional({
    example: 'MGR',
    description: 'Mã vị trí',
  })
  @IsOptional()
  @MaxLength(50)
  positionCode?: string | null;
}
