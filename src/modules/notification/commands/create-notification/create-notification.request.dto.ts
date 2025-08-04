import { IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationRequestDto {
  @ApiProperty({
    example: '',
    description: 'Tiêu đề',
  })
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    example: '',
    description: 'Thông báo',
  })
  @IsNotEmpty()
  @MaxLength(200)
  message: string;

  @ApiProperty({
    example: '',
    description: 'Trạng thái',
  })
  @IsNotEmpty()
  @MaxLength(10)
  type: string;

  @ApiProperty({
    example: false,
    description: 'Trạng thái đọc thông báo',
  })
  isRead: boolean;

  @ApiPropertyOptional({
    example: 'USER001',
    description: 'Mã người dùng',
  })
  @IsOptional()
  @MaxLength(50)
  userCode?: string;
}
