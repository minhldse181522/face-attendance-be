import { Inject, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { UserRepositoryPort } from '@src/modules/user/database/user.repository.port';
import { USER_REPOSITORY } from '@src/modules/user/user.di-tokens';
import { RefreshTokenCommand } from './refresh-token.command';
import { RefreshTokenResponseDto } from '../../dtos/refresh-token.response.dto';
import { UserProfileResponseDto } from '../../dtos/user-profile.response.dto';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenService
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    command: RefreshTokenCommand,
  ): Promise<RefreshTokenResponseDto> {
    const { refreshToken } = command;
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepo.findByUsername(payload.userName);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const newPayload = {
      sub: user.getProps().id.toString(),
      code: user.getProps().code,
      userName: user.getProps().userName,
      firstName: user.getProps().firstName,
      lastName: user.getProps().lastName,
      email: user.getProps().email,
      faceImg: user.getProps().faceImg,
      dob: user.getProps().dob,
      gender: user.getProps().gender,
      phone: user.getProps().phone,
      typeOfWork: user.getProps().typeOfWork,
      isActive: user.getProps().isActive,
      // managedBy: user.getProps().managedBy,
      roleCode: user.getProps().roleCode,
      // positionCode: user.getProps().positionCode,
      addressCode: user.getProps().addressCode,
    };

    const accessToken = this.jwtService.sign(newPayload, {
      expiresIn: '7d',
    });

    const newRefreshToken = this.jwtService.sign(newPayload, {
      expiresIn: '14d',
    });

    const userProps = user.getProps();
    const userProfile: UserProfileResponseDto = {
      id: userProps.id.toString(),
      code: userProps.code,
      userName: userProps.userName,
      fullName: `${userProps.firstName} ${userProps.lastName}`,
      email: userProps.email,
      faceImg: userProps.faceImg || null,
      gender: userProps.gender,
      dob: userProps.dob,
      phone: userProps.phone,
      typeOfWork: userProps.typeOfWork || null,
      // managedBy: userProps.managedBy,
      isActive: userProps.isActive,
      roleCode: userProps.roleCode,
      addressCode: userProps.addressCode,
      // postionCode: userProps.positionCode,
    };

    return {
      accessToken,
      refreshToken: newRefreshToken,
      userProfile,
    };
  }
}
