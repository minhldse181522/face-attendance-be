import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChamCongRequestDto {
  @ApiProperty({
    example: 'USERCODE001',
    description: 'Mã nhân viên',
  })
  @IsNotEmpty()
  @MaxLength(200)
  userCode: string;

  @ApiPropertyOptional({
    example: new Date(),
    description: 'Thời gian vào chấm công',
  })
  @IsOptional()
  checkInTime?: Date;
}
