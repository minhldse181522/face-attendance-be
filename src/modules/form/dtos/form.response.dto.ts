import { ResponseBase } from '@libs/api/response.base';
import { ApiProperty } from '@nestjs/swagger';

export class FormResponseDto extends ResponseBase<any> {
  @ApiProperty({
    example: 'DTC-001',
    description: 'Tiêu đề đơn',
  })
  title: string;

  @ApiProperty({
    example: 'Đơn tăng ca',
    description: 'Mô tả',
  })
  description: string;

  @ApiProperty({
    example: 'R1',
    description: 'Quyền duyệt đơn',
  })
  roleCode: string;

  @ApiProperty({
    example: 'ACTIVE',
    description: 'Trạng thái của đơn',
  })
  status: string;
}
