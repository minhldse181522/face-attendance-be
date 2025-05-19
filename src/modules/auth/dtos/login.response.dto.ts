import { ApiProperty } from '@nestjs/swagger';
import { UserProfileResponseDto } from './user-profile.response.dto';

export class LoginResponseDto {
  @ApiProperty({
    example: '',
    description: 'Access token',
  })
  accessToken: string;

  @ApiProperty({
    example: '',
    description: 'Refresh token',
  })
  refreshToken: string;

  @ApiProperty({
    example: '',
    description: 'Access token',
  })
  userProfile?: UserProfileResponseDto;
}
