import { Inject, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { UserRepositoryPort } from '@src/modules/user/database/user.repository.port';
import { USER_REPOSITORY } from '@src/modules/user/user.di-tokens';
import * as bcrypt from 'bcrypt';
import { LoginResponseDto } from '../../dtos/login.response.dto';
import { UserProfileResponseDto } from '../../dtos/user-profile.response.dto';
import { LoginCommand } from './login.command';

@CommandHandler(LoginCommand)
export class LoginService
  implements ICommandHandler<LoginCommand, LoginResponseDto>
{
  constructor(
    @Inject(USER_REPOSITORY)
    protected readonly userRepo: UserRepositoryPort,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResponseDto> {
    const user = await this.userRepo.findByUsername(command.username);
    if (
      !user ||
      !(await bcrypt.compare(command.password, user.getProps().password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.getProps().id.toString(),
      userName: user.getProps().userName,
      roleCode: user.getProps().roleCode,
      firstName: user.getProps().firstName,
      lastName: user.getProps().lastName,
      faceImg: user.getProps().faceImg,
      email: user.getProps().email,
      bod: user.getProps().bod,
      address: user.getProps().address,
      phone: user.getProps().phone,
      contract: user.getProps().contract,
      branchCode: user.getProps().branchCode,
      positionCode: user.getProps().positionCode,
      managedBy: user.getProps().managedBy,
      isActive: user.getProps().isActive,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '14d',
    });

    const userProps = user.getProps();
    const userProfile: UserProfileResponseDto = {
      id: userProps.id.toString(),
      userName: userProps.userName,
      fullName: `${userProps.firstName} ${userProps.lastName}`,
      role: userProps.roleCode,
      faceImg: userProps.faceImg || null,
      email: userProps.email,
      bod: userProps.bod,
      address: userProps.address,
      phone: userProps.phone,
      contract: userProps.contract || null,
      branchCode: userProps.branchCode,
      postionCode: userProps.positionCode,
      managedBy: userProps.managedBy,
      isActive: userProps.isActive,
    };

    return {
      accessToken,
      refreshToken,
      userProfile,
    };
  }
}
