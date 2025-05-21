import { ApiProperty } from '@nestjs/swagger';
import { Paginated } from '@libs/ddd';

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of items',
    isArray: true,
  })
  readonly data: readonly T[];

  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  readonly count: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  readonly limit: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  readonly page: number;

  constructor(props: Paginated<T>) {
    this.data = props.data;
    this.count = props.count;
    this.limit = props.limit;
    this.page = props.page;
  }
}
