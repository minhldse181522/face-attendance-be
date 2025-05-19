import { IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({
    example: 'user',
    description: 'TÊN TÀI KHOẢN',
  })
  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  @ApiProperty({
    example: 'password',
    description: 'MẬT KHẨU',
  })
  @IsNotEmpty()
  @MaxLength(200)
  password: string;
}
