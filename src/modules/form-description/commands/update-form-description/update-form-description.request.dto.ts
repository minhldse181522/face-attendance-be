import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateFormDescriptionRequestDto {
  @ApiPropertyOptional({
    example: 'PENDING|APPROVED|REJECTED|CANCELED',
    description: 'Trạng thái đơn',
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELED'],
  })
  @IsOptional()
  @IsEnum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELED'])
  status?: string;

  @ApiPropertyOptional({
    example: '2023-01-01T12:00:00.000Z',
    description: 'Thời gian phê duyệt',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  approvedTime?: Date;

  @ApiPropertyOptional({
    example: 'MANAGER001',
    description: 'Mã người phê duyệt đơn',
  })
  @IsOptional()
  @MaxLength(50)
  approvedBy?: string;
}
