import { ResponseBase } from '@libs/api/response.base';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto extends ResponseBase<any> {
  @ApiProperty({
    example: 'USER0001',
    description: 'Mã người dùng',
  })
  code: string;

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
  dob: Date;

  @ApiProperty({
    example: 'M',
    description: 'Giới tính',
  })
  gender: string;

  @ApiProperty({
    example: '0987654321',
    description: 'Số điện thoại',
  })
  phone: string;

  @ApiPropertyOptional({
    example: 'xxx.pdf',
    description: 'Hợp đồng',
  })
  typeOfWork?: string | null;

  @ApiProperty({
    example: 'HAC',
    description: 'Mã chi nhánh',
  })
  addressCode?: string | null;

  @ApiProperty({
    example: 'SEP',
    description: 'Mã vị trí',
  })
  positionCode?: string | null;

  @ApiProperty({
    example: 'admin',
    description: 'Quản lý bởi',
  })
  managedBy?: string | null;

  @ApiPropertyOptional({
    example: true,
    description: 'Đang hoạt động',
  })
  isActive?: boolean | null;

  @ApiProperty({
    example: 'HCM Branch, Hanoi Branch',
    description: 'Tên chi nhánh',
  })
  branchName: string;
}
