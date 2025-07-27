import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ThanhToanLuongRequestDto {
  @ApiProperty({
    example: 'ACCEPT',
    description: 'Trạng thái thanh toán',
  })
  @IsNotEmpty()
  @MaxLength(20)
  status: string;
}
