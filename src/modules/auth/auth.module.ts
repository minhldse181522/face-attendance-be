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

const httpControllers = [LoginHttpController, RegisterHttpController];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [LoginService, RegisterService];

const queryHandlers: Provider[] = [];

const mappers: Provider[] = [];

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
  ],
})
export class AuthModule {}
