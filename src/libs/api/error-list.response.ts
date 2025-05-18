import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ErrorResponseType } from '../types/error-response.type';

export class ErrorListResponseDto<E, T> {
  @ApiProperty({ example: 400 })
  readonly statusCode: number;

  @ApiProperty({ example: 'Processed with partial success' })
  readonly message: string;

  @ApiProperty({ isArray: true })
  readonly error?: readonly ErrorResponseType<E>[];

  @ApiPropertyOptional({ isArray: true })
  readonly data?: readonly T[];

  constructor(body: ErrorListResponseDto<E, T>) {
    this.statusCode = body.statusCode;
    this.message = body.message;
    this.error = body.error;
    this.data = body.data;
  }
}
