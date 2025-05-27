import { ResponseBase } from '@libs/api/response.base';
import { ApiProperty } from '@nestjs/swagger';

export class BranchResponseDto extends ResponseBase<any> {
  @ApiProperty({
    example: 'R1',
    description: 'Mã chi nhánh',
  })
  code: string;

  @ApiProperty({
    example: 'Chi nhánh Sài Gòn',
    description: 'Tên chi nhánh',
  })
  branchName: string;

  @ApiProperty({
    example: '123 Nguyễn Văn Cừ, Quận 4, TP. Hồ Chí Minh',
    description: 'Địa chỉ chi nhánh',
  })
  addressLine: string;

  @ApiProperty({
    example: 'ChIJd8BlQ2BZwokRAFUEcm_qrcA',
    description: 'Google Place ID của chi nhánh',
  })
  placeId: string;

  @ApiProperty({
    example: 'TP. Hồ Chí Minh',
    description: 'Thành phố nơi chi nhánh đặt trụ sở',
  })
  city: string;

  @ApiProperty({
    example: 'Quận 4',
    description: 'Quận/huyện nơi chi nhánh đặt trụ sở',
  })
  district: string;

  @ApiProperty({
    example: 10.762622,
    description: 'Vĩ độ (latitude) của chi nhánh',
  })
  lat: number;

  @ApiProperty({
    example: 106.660172,
    description: 'Kinh độ (longitude) của chi nhánh',
  })
  long: number;

  @ApiProperty({
    example: 'C1',
    description: 'Mã công ty sở hữu chi nhánh',
  })
  companyCode: string;
}
