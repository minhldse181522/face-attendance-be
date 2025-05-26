import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { FormDescriptionStatus } from '../../domain/form-description.type';

export class CreateFormDescriptionRequestDto {
  @ApiProperty({
    example: 'Bận việc gia đình',
    description: 'Lý do mô tả biểu mẫu',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    example: 'PENDING | APPROVED | REJECTED',
    description: 'TRẠNG THÁI ĐƠN',
    required: true,
  })
  @IsEnum(FormDescriptionStatus)
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    example: 'bằng chứng đâu ní',
    description: 'Bằng chứng đính kèm',
    required: true,
  })
  @IsOptional()
  @IsNotEmpty()
  file?: string;

  @ApiProperty({
    example: '2023-10-01T00:00:00Z',
    description: 'startTime status',
    required: false,
  })
  @IsDateString()
  startTime: Date;

  @ApiProperty({
    example: '2023-10-31T23:59:59Z',
    description: 'endTime status',
    required: false,
  })
  @IsString()
  @IsDateString()
  endTime: Date;

  @ApiProperty({
    example: 'id của form',
    description: 'formId status',
    required: false,
  })
  @IsNotEmpty()
  formId: string;
}
