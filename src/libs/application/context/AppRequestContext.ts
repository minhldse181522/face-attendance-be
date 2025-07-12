import { RequestUser } from '@src/modules/auth/domain/value-objects/request-user.value-objects';
import { RequestContext } from 'nestjs-request-context';

/**
 * Setting some isolated context for each request.
 */

export class AppRequestContext extends RequestContext {
  requestId!: string;
  tenantId?: string;
  user: any;
}
// Thêm vào đầu file AppRequestContext.ts
let fallbackContext: Partial<AppRequestContext> | undefined;

export class RequestContextService {
  static getContext(): AppRequestContext {
    try {
      const ctx = RequestContext.currentContext?.req as AppRequestContext;
      if (ctx) return ctx;
    } catch (e) {
      // ignore
    }

    // Nếu không có context từ HTTP request, dùng fallback (cho cron job)
    if (fallbackContext) {
      return fallbackContext as AppRequestContext;
    }

    throw new Error('Request context is not available');
  }
  static runWithContext(
    ctx: Partial<AppRequestContext>,
    fn: () => Promise<void>,
  ) {
    fallbackContext = ctx;

    return fn().finally(() => {
      fallbackContext = undefined;
    });
  }

  static setRequestId(id: string): void {
    const ctx = this.getContext();
    ctx.requestId = id;
  }

  static getRequestId(): string {
    return this.getContext().requestId;
  }

  static setTenantId(id?: string): void {
    const ctx = this.getContext();
    ctx.tenantId = id;
  }

  static getTenantId(): string | undefined {
    return this.getContext().tenantId;
  }

  static setRequestUser(user?: RequestUser): void {
    const ctx = this.getContext();
    ctx.user = user;
  }

  static getRequestUser(): RequestUser | undefined {
    return this.getContext()?.user;
  }

  static getRequestUsername(): string | null {
    return this.getContext()?.user?.username ?? null;
  }
}
