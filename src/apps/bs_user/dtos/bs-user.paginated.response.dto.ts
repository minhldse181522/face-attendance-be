import { PaginatedResponseDto } from '@libs/api/paginated.response.base';
import { ApiProperty } from '@nestjs/swagger';
import { BsUserResponseDto } from './bs-user.response.dto';

export class BsUserPaginatedResponseDto extends PaginatedResponseDto<BsUserResponseDto> {
  @ApiProperty({ type: BsUserResponseDto, isArray: true })
  readonly data: readonly BsUserResponseDto[];
}
