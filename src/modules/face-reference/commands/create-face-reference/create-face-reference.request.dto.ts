import { IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFaceReferenceRequestDto {
  @ApiProperty({
    example: '',
    description: 'Ảnh',
  })
  @IsNotEmpty()
  @MaxLength(200)
  faceImg: string;

  @ApiProperty({
    example: '',
    description: 'Mã nhân viên',
  })
  @IsNotEmpty()
  @MaxLength(50)
  userCode: string;
}
