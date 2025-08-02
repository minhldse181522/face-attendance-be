import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { FormDescriptionStatus } from '@src/modules/form-description/domain/form-description.type';

export class TaoDonRequestDto {
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
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  @IsNotEmpty()
  file?: string;

  @ApiProperty({
    example: new Date(),
    description: 'startTime status',
    required: false,
  })
  @IsDateString()
  startTime: Date;

  @ApiProperty({
    example: new Date(),
    description: 'endTime status',
    required: false,
  })
  @IsString()
  @IsDateString()
  endTime: Date;

  @ApiPropertyOptional({
    example: true,
    description: 'Có phải đơn tăng ca',
  })
  @IsOptional()
  statusOvertime?: boolean | null;

  @ApiProperty({
    example: 'id của form',
    description: 'formId status',
    required: false,
  })
  @IsNotEmpty()
  formId: string;
}
