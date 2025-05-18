import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  FilterOperationType,
  FilterOrder,
  GeneratedFindOptions,
  IFilter,
  IGeneratedFilter,
  ISingleFilter,
  ISingleOrder,
} from '@chax-at/prisma-filter';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { get } from 'env-var';

// The fields are also validated in filter.parser.ts to make sure that only correct fields are used to filter
export class SingleFilter<T> implements ISingleFilter<T> {
  @IsString()
  field!: keyof T & string;

  @IsEnum(FilterOperationType)
  type!: FilterOperationType;

  @IsDefined()
  value: any;
}

export class SingleFilterOrder<T> implements ISingleOrder<T> {
  @IsString()
  field!: keyof T & string;

  @IsIn(['asc', 'desc'])
  dir!: FilterOrder;
}

export class Filter<T = any> implements IFilter<T> {
  @ApiPropertyOptional({
    description: 'The offset of the first result to return',
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  readonly offset = 0;

  @ApiPropertyOptional({
    description: 'The maximum number of results to return',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(get('LIMIT_DATA').default(1000).asIntPositive())
  readonly limit = 100;

  @ApiPropertyOptional({
    description: 'Filter to apply',
    type: () => [SingleFilter],
    required: false,
    example: [{ field: 'id', type: FilterOperationType.Eq, value: '1' }],
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleFilter)
  @IsOptional()
  readonly filter?: Array<SingleFilter<T>>;

  @ApiPropertyOptional({
    description: 'Order to apply',
    type: () => [SingleFilterOrder],
    required: false,
    example: [{ field: 'id', dir: 'asc' }],
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleFilterOrder)
  @IsOptional()
  readonly order?: Array<SingleFilterOrder<T>>;
}

export class FilterDto<TWhereInput>
  extends Filter
  implements IGeneratedFilter<TWhereInput>
{
  // This will be set by filter pipe
  findOptions!: GeneratedFindOptions<TWhereInput>;
}
