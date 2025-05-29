import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './jwt.strategy';
import { LoginService } from './commands/login/login.service';
import { LoginHttpController } from './commands/login/login.http.controller';
import { RegisterHttpController } from './commands/register/register.http.controller';
import { RegisterService } from './commands/register/register.service';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { RefreshTokenHttpController } from './commands/refresh-token/refresh-token.http.controller';
import { RefreshTokenService } from './commands/refresh-token/refresh-token.service';
import { LogoutHttpController } from './commands/logout/logout.http.controller';
import { LogoutService } from './commands/logout/logout.service';

const httpControllers = [
  LoginHttpController,
  RegisterHttpController,
  RefreshTokenHttpController,
  LogoutHttpController,
];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [
  LoginService,
  RegisterService,
  RefreshTokenService,
  LogoutService,
];

const queryHandlers: Provider[] = [];

const mappers: Provider[] = [];

const utils: Provider[] = [GenerateCode];

const repositories: Provider[] = [];

@Module({
  imports: [
    CqrsModule,
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [...httpControllers, ...messageControllers],
  providers: [
    JwtStrategy,
    Logger,
    ...cliControllers,
    ...repositories,
    ...graphqlResolvers,
    ...commandHandlers,
    ...queryHandlers,
    ...mappers,
    ...utils,
  ],
})
export class AuthModule {}
