import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RefreshTokenRequestDto {
  @ApiProperty({
    example: '',
    description: 'Refresh Token',
  })
  @IsNotEmpty()
  refreshToken: string;
}
