import { PaginatedResponseDto } from '@libs/api/paginated.response.base';
import { ApiProperty } from '@nestjs/swagger';
import { DropDownResponseDto } from './dropdown.response.dto';

export class UserByManagementPaginatedResponseDto extends PaginatedResponseDto<DropDownResponseDto> {
  @ApiProperty({ type: DropDownResponseDto, isArray: true })
  readonly data: readonly DropDownResponseDto[];
}
