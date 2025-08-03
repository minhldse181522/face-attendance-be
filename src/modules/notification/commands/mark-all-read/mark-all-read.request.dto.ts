import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class MarkAllReadRequestDto {
  @ApiProperty({
    example: 'USER001',
    description: 'Mã người dùng',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(36)
  userCode: string;
}
