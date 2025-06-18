import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class BigIntSerializationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.transformBigInt(data)));
  }

  private transformBigInt(obj: unknown, seen = new WeakSet()): any {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'bigint') {
      return obj.toString();
    }

    if (typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Buffer || obj instanceof Date) {
      return obj;
    }

    // Avoid circular references
    if (seen.has(obj)) {
      return '[Circular]';
    }
    seen.add(obj);

    if (Array.isArray(obj)) {
      return obj.map((item) => this.transformBigInt(item, seen));
    }

    const transformed: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        try {
          transformed[key] = this.transformBigInt((obj as any)[key], seen);
        } catch {
          transformed[key] = '[Unserializable]';
        }
      }
    }

    return transformed;
  }
}
