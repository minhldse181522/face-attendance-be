import { PaginatedResponseDto } from '@libs/api/paginated.response.base';
import { ApiProperty } from '@nestjs/swagger';
import { BranchResponseDto } from './branch.response.dto';

export class BranchPaginatedResponseDto extends PaginatedResponseDto<BranchResponseDto> {
  @ApiProperty({ type: BranchResponseDto, isArray: true })
  readonly data: readonly BranchResponseDto[];
}
