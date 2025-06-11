import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class DeleteObjectRequestDto {
  @ApiProperty({
    example:
      '12345/12345_3',
    description: `Path`,
  })
  @IsNotEmpty()
  @MaxLength(200)
  path: string;
}
