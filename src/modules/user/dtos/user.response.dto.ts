import { ResponseBase } from '@libs/api/response.base';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto extends ResponseBase<any> {
  @ApiProperty({
    example: 'utest',
    description: 'Tên đăng nhập',
  })
  userName: string;

  @ApiProperty({
    example: 'R1',
    description: 'Vai trò',
  })
  roleCode: string;

  @ApiProperty({
    example: 'Pham',
    description: 'Họ',
  })
  firstName: string;

  @ApiProperty({
    example: 'Tú',
    description: 'Tên',
  })
  lastName: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Ảnh nhân sự',
  })
  faceImg?: string | null;

  @ApiProperty({
    example: 'test@gmail.com',
    description: 'Mail',
  })
  email: string;

  @ApiProperty({
    example: new Date(),
    description: 'Ngày tháng năm sinh',
  })
  bod: Date;

  @ApiProperty({
    example: '126 Las Vegas',
    description: 'Địa chỉ',
  })
  address: string;

  @ApiProperty({
    example: '0987654321',
    description: 'Số điện thoại',
  })
  phone: string;

  @ApiPropertyOptional({
    example: 'xxx.pdf',
    description: 'Hợp đồng',
  })
  contract?: string | null;

  @ApiProperty({
    example: 'HAC',
    description: 'Mã chi nhánh',
  })
  branchCode: string;

  @ApiProperty({
    example: 'SEP',
    description: 'Mã vị trí',
  })
  positionCode: string;

  @ApiProperty({
    example: 'admin',
    description: 'Quản lý bởi',
  })
  managedBy: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Đang hoạt động',
  })
  isActive?: boolean | null;
}
