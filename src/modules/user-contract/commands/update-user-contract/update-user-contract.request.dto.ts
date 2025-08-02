import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateUserContractRequestDto } from '../create-user-contract/create-user-contract.request.dto';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class UpdateUserContractRequestDto extends PartialType(
  CreateUserContractRequestDto,
) {
  @ApiPropertyOptional({
    example: ['BRANCH2507190001', 'BRANCH2507310001'],
    description: 'List of branch codes associated with the user contract',
  })
  @Type(() => String)
  @IsOptional()
  branchCodes?: string[] | null;
}
