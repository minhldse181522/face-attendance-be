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

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    const refreshToken = this.jwtService.sign(payload, {
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
      refreshToken,
      userProfile,
    };
  }
}
