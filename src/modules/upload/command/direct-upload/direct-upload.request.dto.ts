import { IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DirectUploadDto {
  @ApiProperty({
    example: '',
    description: 'Key (path) of the file in the storage (MinIO)',
  })
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    example: '',
    description: 'Mã nhân viên',
  })
  @IsNotEmpty()
  @MaxLength(50)
  userCode: string;
}
