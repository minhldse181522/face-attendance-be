import { PaginatedResponseDto } from '@libs/api/paginated.response.base';
import { ApiProperty } from '@nestjs/swagger';
import { UserContractResponseDto } from './user-contract.response.dto';

export class UserContractPaginatedResponseDto extends PaginatedResponseDto<UserContractResponseDto> {
  @ApiProperty({ type: UserContractResponseDto, isArray: true })
  readonly data: readonly UserContractResponseDto[];
}
