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

  @ApiPropertyOptional({
    example: '',
    description: 'Full Name',
  })
  fullName: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Role',
  })
  role: string;

  @ApiProperty({
    example: '',
    description: 'Ảnh nhân sự',
  })
  faceImg: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Email',
  })
  email: string;

  @ApiProperty({
    example: '',
    description: 'Address',
  })
  address: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Birth Day',
  })
  bod: Date;

  @ApiPropertyOptional({
    example: '',
    description: 'Phone',
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
