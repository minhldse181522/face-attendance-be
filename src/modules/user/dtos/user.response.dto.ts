import { ResponseBase } from '@libs/api/response.base';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({
    example: '',
    description: 'Ảnh nhân sự',
  })
  faceImg: string;

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

  @ApiProperty({
    example: 'xxx.pdf',
    description: 'Hợp đồng',
  })
  contract: string;

  @ApiProperty({
    example: 'HAC',
    description: 'Mã chi nhánh',
  })
  branchCode: string;

  @ApiProperty({
    example: 'admin',
    description: 'Quản lý bởi',
  })
  managedBy: string;
}
