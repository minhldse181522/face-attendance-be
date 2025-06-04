import { ResponseBase } from '@libs/api/response.base';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PositionResponseDto extends ResponseBase<any> {
  @ApiPropertyOptional({
    example: 'POS001',
    description: 'Mã vị trí',
  })
  code?: string | null;

  @ApiPropertyOptional({
    example: 'CEO',
    description: 'Tên vị trí',
  })
  positionName?: string | null;

  @ApiProperty({
    example: 'R1',
    description: 'Tên vai trò',
  })
  role: string;

  @ApiPropertyOptional({
    example: 'Chief Executive Officer',
    description: 'Mô tả',
  })
  description?: string | null;

  @ApiPropertyOptional({
    example: '',
    description: 'Lương cơ bản',
  })
  baseSalary?: number | null;

  @ApiPropertyOptional({
    example: '',
    description: 'Phụ cấp',
  })
  allowance?: number | null;

  @ApiPropertyOptional({
    example: '',
    description: 'Lương làm thêm giờ',
  })
  overtimeSalary?: number | null;

  @ApiPropertyOptional({
    example: '',
    description: 'Phí đi làm trễ',
  })
  lateFine?: number | null;
}
