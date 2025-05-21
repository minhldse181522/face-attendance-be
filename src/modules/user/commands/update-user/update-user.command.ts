import { Command, ICommand } from '@nestjs/cqrs';
import { UpdateUserRequestDto } from './update-user.request.dto';

export class UpdateUserCommand implements ICommand {
  constructor(
    readonly userId: string,
    readonly dto: UpdateUserRequestDto,
  ) {}
}
