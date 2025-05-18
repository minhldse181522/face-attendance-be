import { applyDecorators, SetMetadata } from '@nestjs/common';

export const API_LOG_RESOURCE = 'API_LOG_RESOURCE';
// Xác định tài nguyên đang bị truy cập
export function ApiLogResource(resource: string): MethodDecorator {
  return applyDecorators(SetMetadata(API_LOG_RESOURCE, resource));
}

export const API_LOG_ACTION = 'API_LOG_ACTION';
// Cho biết hành động cụ thể
export function ApiLogAction(resource: string): MethodDecorator {
  return applyDecorators(SetMetadata(API_LOG_ACTION, resource));
}

export const API_LOG_ERROR_MESSAGE = 'API_LOG_ERROR_MESSAGE';
// Khai báo thông báo lỗi mặc định để log ra nếu method đó gặp lỗi.
export function ApiLogErrorMessage(message: string): MethodDecorator {
  return applyDecorators(SetMetadata(API_LOG_ERROR_MESSAGE, message));
}

// Truyền 3 giá trị trong 1 lần gọi
export function ApiLogMetadata(data: {
  resource?: string;
  action?: string;
  errorMessage?: string;
}): MethodDecorator {
  const decorators: MethodDecorator[] = [];

  if (data.resource) {
    decorators.push(ApiLogResource(data.resource));
  }
  if (data.action) {
    decorators.push(ApiLogAction(data.action));
  }
  if (data.errorMessage) {
    decorators.push(ApiLogErrorMessage(data.errorMessage));
  }

  return applyDecorators(...decorators);
}
