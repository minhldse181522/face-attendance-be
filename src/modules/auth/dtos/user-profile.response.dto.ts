import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty({
    example: '',
    description: 'ID',
  })
  id: string;

  @ApiProperty({
    example: '',
    description: 'CODE',
  })
  code: string;

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
    description: 'Email',
  })
  email: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Ảnh nhân sự',
  })
  faceImg?: string | null;

  @ApiProperty({
    example: '',
    description: 'Birth Day',
  })
  dob: Date;

  @ApiProperty({
    example: '',
    description: 'Giới tính',
  })
  gender: string;

  @ApiProperty({
    example: '',
    description: 'Phone',
  })
  phone: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Type of work',
  })
  typeOfWork?: string | null;

  @ApiProperty({
    example: 'admin',
    description: 'Quản lý bởi',
  })
  managedBy?: string | null;

  @ApiPropertyOptional({
    example: true,
    description: 'Trạng thái hoạt động',
  })
  isActive: boolean;

  @ApiProperty({
    example: '',
    description: 'Role',
  })
  roleCode: string;

  @ApiProperty({
    example: 'HAC',
    description: 'Mã chi nhánh',
  })
  postionCode?: string | null;

  @ApiProperty({
    example: 'HAC',
    description: 'Mã địa chỉ',
  })
  addressCode?: string | null;
}
