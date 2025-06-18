import { IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBranchRequestDto {
  @ApiProperty({
    example: 'Chi nhánh Sài Gòn',
    description: 'Tên chi nhánh',
  })
  @IsNotEmpty()
  @MaxLength(200)
  branchName: string;

  @ApiProperty({
    example: '123 Nguyễn Văn Cừ, Quận 4, TP. Hồ Chí Minh',
    description: 'Địa chỉ chi nhánh',
  })
  @IsNotEmpty()
  @MaxLength(200)
  addressLine: string;

  @ApiProperty({
    example: 'ChIJd8BlQ2BZwokRAFUEcm_qrcA',
    description: 'Google Place ID của chi nhánh',
  })
  @IsNotEmpty()
  @MaxLength(200)
  placeId: string;

  @ApiProperty({
    example: 'TP. Hồ Chí Minh',
    description: 'Thành phố nơi chi nhánh đặt trụ sở',
  })
  @IsNotEmpty()
  @MaxLength(50)
  city: string;

  @ApiProperty({
    example: 'Quận 4',
    description: 'Quận/huyện nơi chi nhánh đặt trụ sở',
  })
  @IsNotEmpty()
  @MaxLength(50)
  district: string;

  @ApiProperty({
    example: 10.762622,
    description: 'Vĩ độ (latitude) của chi nhánh',
  })
  @IsNotEmpty()
  lat: number;

  @ApiProperty({
    example: 106.660172,
    description: 'Kinh độ (longitude) của chi nhánh',
  })
  @IsNotEmpty()
  long: number;

  @ApiProperty({
    example: 'C1',
    description: 'Mã công ty sở hữu chi nhánh',
  })
  @IsNotEmpty()
  @MaxLength(20)
  companyCode: string;
}
