import { IsNotEmpty, IsNumber, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSignedUrlRequestDto {
  @ApiProperty({
    example: 'ABC12345',
    description: `SỐ TIẾP NHẬN`,
  })
  @IsNotEmpty()
  @MaxLength(100)
  soTn: string;
}
