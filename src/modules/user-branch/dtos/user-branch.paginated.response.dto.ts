import { PaginatedResponseDto } from '@libs/api/paginated.response.base';
import { ApiProperty } from '@nestjs/swagger';
import { UserBranchResponseDto } from './user-branch.response.dto';

export class UserBranchPaginatedResponseDto extends PaginatedResponseDto<UserBranchResponseDto> {
  @ApiProperty({ type: UserBranchResponseDto, isArray: true })
  readonly data: readonly UserBranchResponseDto[];
}
