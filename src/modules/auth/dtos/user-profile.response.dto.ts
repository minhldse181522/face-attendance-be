import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty({
    example: '',
    description: 'ID',
  })
  id: string;

  @ApiProperty({
    example: '',
    description: 'Username',
  })
  userName: string;

  @ApiProperty({
    example: '',
    description: 'Full Name',
  })
  fullName: string;

  @ApiProperty({
    example: '',
    description: 'Role',
  })
  role: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Ảnh nhân sự',
  })
  faceImg?: string | null;

  @ApiProperty({
    example: '',
    description: 'Email',
  })
  email: string;

  @ApiProperty({
    example: '',
    description: 'Address',
  })
  address: string;

  @ApiProperty({
    example: '',
    description: 'Birth Day',
  })
  bod: Date;

  @ApiProperty({
    example: '',
    description: 'Phone',
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
    example: 'HAC',
    description: 'Mã chi nhánh',
  })
  postionCode: string;

  @ApiProperty({
    example: 'admin',
    description: 'Quản lý bởi',
  })
  managedBy: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Trạng thái hoạt động',
  })
  isActive?: boolean | null;
}
