import { PartialType } from '@nestjs/swagger';
import { CreateUserContractRequestDto } from '../create-user-contract/create-user-contract.request.dto';

export class UpdateUserContractRequestDto extends PartialType(
  CreateUserContractRequestDto,
) {
  // Add more properties here
}
