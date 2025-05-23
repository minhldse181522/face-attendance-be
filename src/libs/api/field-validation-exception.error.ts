import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { FieldValidationException } from './api-validation-error.exception';

@Catch(FieldValidationException)
export class FieldValidationExceptionFilter
  implements ExceptionFilter<FieldValidationException>
{
  catch(exception: FieldValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(exception.status || HttpStatus.BAD_REQUEST).json({
      status: exception.status,
      error: exception.errors,
    });
  }
}
