import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class DeleteShiftRequestDto {
  @ApiProperty({
    example: 'NOTACTIVE',
    description: 'Trạng thái',
  })
  @IsNotEmpty()
  @MaxLength(10)
  status: string;
}
