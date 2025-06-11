import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  SetMetadata,
  applyDecorators,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitService } from './rate-limit.service';
import { RequestUser } from '@src/modules/auth/domain/value-objects/request-user.value-objects';

export const RATE_LIMIT = 'RATE_LIMIT_KEY';

export function RateLimit(limit: number): MethodDecorator {
  return applyDecorators(SetMetadata(RATE_LIMIT, limit));
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly _reflector: Reflector,
    private readonly rateLimitService: RateLimitService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Get user and check permissions
      const request = context.switchToHttp().getRequest();
      const user = request.user as RequestUser;

      // Get custom limit from handler
      const limit: number | undefined = this._reflector.get(
        RATE_LIMIT,
        context.getHandler(),
      );

      // construct key
      const key = `${user?.userName || 'anonymous'}:${request.ip}:${
        request.path
      }`;

      const isValid = await this.rateLimitService.check(key, limit);

      if (!isValid) {
        throw new HttpException(
          'Rate limit exceeded',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('Error in RateLimit Guard', error);
      return false;
    }
  }
}
