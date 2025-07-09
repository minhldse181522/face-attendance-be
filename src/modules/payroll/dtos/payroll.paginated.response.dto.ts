import { PaginatedResponseDto } from '@libs/api/paginated.response.base';
import { ApiProperty } from '@nestjs/swagger';
import { PayrollResponseDto } from './payroll.response.dto';

export class PayrollPaginatedResponseDto extends PaginatedResponseDto<PayrollResponseDto> {
  @ApiProperty({ type: PayrollResponseDto, isArray: true })
  readonly data: readonly PayrollResponseDto[];
}
