import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({
    example: '',
    description: 'Username',
  })
  userName: string;

  @ApiProperty({
    example: '',
    description: 'First Name',
  })
  firstName: string;

  @ApiProperty({
    example: '',
    description: 'First Name',
  })
  lastName: string;

  @ApiProperty({
    example: '',
    description: 'Role',
  })
  roleCode: string;

  @ApiProperty({
    example: '',
    description: 'Email',
  })
  email: string;

  @ApiProperty({
    example: '',
    description: 'Phone',
  })
  phone: string;

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
}
