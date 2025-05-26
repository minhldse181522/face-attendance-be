import { PaginatedResponseDto } from '@libs/api/paginated.response.base';
import { ApiProperty } from '@nestjs/swagger';
import { FormDescriptionResponseDto } from './form-description.response.dto';

export class FormDescriptionPaginatedResponseDto extends PaginatedResponseDto<FormDescriptionResponseDto> {
  @ApiProperty({ type: FormDescriptionResponseDto, isArray: true })
  readonly data: readonly FormDescriptionResponseDto[];
}
