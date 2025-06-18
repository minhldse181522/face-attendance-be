import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class UpdateFaceReferenceRequestDto {
  @ApiPropertyOptional({
    example: '',
    description: 'code',
  })
  @IsOptional()
  @MaxLength(200)
  code?: string | null;

  @ApiPropertyOptional({
    example: '',
    description: 'Ảnh',
  })
  @IsOptional()
  @MaxLength(200)
  faceImg?: string | null;

  @ApiPropertyOptional({
    example: '',
    description: 'Mã nhân viên',
  })
  @IsOptional()
  @MaxLength(50)
  userCode?: string | null;
}
