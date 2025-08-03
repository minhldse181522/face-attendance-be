import { PaginatedResponseDto } from '@libs/api/paginated.response.base';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationResponseDto } from './notification.response.dto';

export class NotificationPaginatedResponseDto extends PaginatedResponseDto<NotificationResponseDto> {
  @ApiProperty({ type: NotificationResponseDto, isArray: true })
  readonly data: readonly NotificationResponseDto[];
}
