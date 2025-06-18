import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';

export class UpdateBranchRequestDto {
  @ApiPropertyOptional({
    example: 'Chi nhánh Sài Gòn',
    description: 'Tên chi nhánh',
  })
  @IsOptional()
  @MaxLength(200)
  branchName?: string | null;

  @ApiPropertyOptional({
    example: '123 Nguyễn Văn Cừ, Quận 4, TP. Hồ Chí Minh',
    description: 'Địa chỉ chi nhánh',
  })
  @IsOptional()
  @MaxLength(200)
  addressLine?: string | null;

  @ApiPropertyOptional({
    example: 'ChIJd8BlQ2BZwokRAFUEcm_qrcA',
    description: 'Google Place ID của chi nhánh',
  })
  @IsOptional()
  @MaxLength(200)
  placeId?: string | null;

  @ApiPropertyOptional({
    example: 'TP. Hồ Chí Minh',
    description: 'Thành phố nơi chi nhánh đặt trụ sở',
  })
  @IsOptional()
  @MaxLength(50)
  city?: string | null;

  @ApiPropertyOptional({
    example: 'Quận 4',
    description: 'Quận/huyện nơi chi nhánh đặt trụ sở',
  })
  @IsOptional()
  @MaxLength(50)
  district?: string | null;

  @ApiPropertyOptional({
    example: 10.762622,
    description: 'Vĩ độ (latitude) của chi nhánh',
  })
  @IsOptional()
  lat?: number | null;

  @ApiPropertyOptional({
    example: 106.660172,
    description: 'Kinh độ (longitude) của chi nhánh',
  })
  @IsOptional()
  long?: number | null;

  @ApiPropertyOptional({
    example: 'C1',
    description: 'Mã công ty sở hữu chi nhánh',
  })
  @IsOptional()
  @MaxLength(20)
  companyCode?: string | null;
}
