import { PaginatedResponseDto } from '@libs/api/paginated.response.base';
import { ApiProperty } from '@nestjs/swagger';
import { FormResponseDto } from './form.response.dto';

export class FormPaginatedResponseDto extends PaginatedResponseDto<FormResponseDto> {
  @ApiProperty({ type: FormResponseDto, isArray: true })
  readonly data: readonly FormResponseDto[];
}
