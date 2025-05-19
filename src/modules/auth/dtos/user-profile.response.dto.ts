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

  @ApiPropertyOptional({
    example: '',
    description: 'Email',
  })
  email: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Phone',
  })
  phone: string;

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
}
