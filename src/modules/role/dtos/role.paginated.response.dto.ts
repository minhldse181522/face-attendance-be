import { PaginatedResponseDto } from '@libs/api/paginated.response.base';
import { ApiProperty } from '@nestjs/swagger';
import { RoleResponseDto } from './role.response.dto';

export class RolePaginatedResponseDto extends PaginatedResponseDto<RoleResponseDto> {
  @ApiProperty({ type: RoleResponseDto, isArray: true })
  readonly data: readonly RoleResponseDto[];
}
