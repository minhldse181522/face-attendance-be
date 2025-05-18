import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiErrorResponse {
  @ApiProperty({ example: 400 })
  readonly statusCode: number;

  @ApiProperty({ example: 'Validation Error' })
  readonly message: string;

  @ApiProperty({ example: 'Bad Request' })
  readonly error: string;

  @ApiPropertyOptional({ example: 'YevPQs' })
  readonly errorCode?: string;

  @ApiProperty({ example: 'YevPQs' })
  readonly correlationId: string;

  @ApiPropertyOptional({
    example: ['incorrect email'],
    description: 'Optional list of sub-errors',
  })
  readonly subErrors?: string[];

  constructor(body: ApiErrorResponse) {
    this.statusCode = body.statusCode;
    this.message = body.message;
    this.error = body.error;
    this.correlationId = body.correlationId;
    this.subErrors = body.subErrors;
  }
}
