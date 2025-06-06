import { USER_REPOSITORY } from '@modules/user/user.di-tokens';
import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { RegisterCommand } from './register.command';
import { UserRepositoryPort } from '@src/modules/user/database/user.repository.port';
import { Err, Ok, Result } from 'oxide.ts';
import { UserEntity } from '@src/modules/user/domain/user.entity';
import { RegisterError } from '../../domain/auth.error';
import { FieldValidationException } from '@src/libs/api/api-validation-error.exception';
import { GenerateCode } from '@src/libs/utils/generate-code.util';

export type RegisterServiceResult = Result<UserEntity, any>;

@CommandHandler(RegisterCommand)
export class RegisterService implements ICommandHandler<RegisterCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
    private readonly generateCode: GenerateCode,
  ) {}

  async execute(command: RegisterCommand): Promise<RegisterServiceResult> {
    const errors: Record<string, string> = {};
    const existing = await this.userRepo.findByUsername(command.userName);
    if (existing) {
      errors['userName'] = 'Tên đăng nhập đã bị trùng. Vui lòng nhập tên khác';
    }

    if (Object.keys(errors).length > 0) {
      throw new FieldValidationException(errors);
    }

    const hashedPassword = await bcrypt.hash(command.password, 10);
    const props = command.getExtendedProps<RegisterCommand>();
    const code = await this.generateCode.generateCode('USER', 4);
    const newUser = UserEntity.create({
      ...props,
      code: code,
      password: hashedPassword,
      isActive: true,
    });

    try {
      const createdUser = await this.userRepo.insert(newUser);
      return Ok(createdUser);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new RegisterError(error));
      }
      throw error;
    }
  }
}
