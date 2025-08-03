import { ResponseBase } from '@libs/api/response.base';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationResponseDto extends ResponseBase<any> {
  @ApiProperty({
    example: 'AB',
    description: 'Tiêu đề',
  })
  title: string;

  @ApiProperty({
    example: 'ABCD',
    description: 'Thông báo',
  })
  message: string;

  @ApiProperty({
    example: 'Thành công',
    description: 'Loại thông báo',
  })
  type: string;

  @ApiProperty({
    example: false,
    description: 'Trạng thái thông báo',
  })
  isRead: boolean;

  @ApiPropertyOptional({
    example: 'USER001',
    description: 'Mã người dùng',
  })
  userCode?: string;
}
