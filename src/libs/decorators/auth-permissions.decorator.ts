import { SetMetadata, applyDecorators } from '@nestjs/common';
// Gắn metadata tùy chỉnh vào các class, method, hoặc property
// Metadata này sau đó có thể được truy cập lại trong Guard, Interceptor, Pipe
// hoặc bất kỳ phần nào cần xử lý logic dựa trên thông tin được gắn

export const AUTH_RESOURCE = 'AUTH_RESOURCE';
export const AUTH_SCOPE = 'AUTH_SCOPE';

// gắn thông tin về resource (đối tượng truy cập vào route)
// ví dụ: Route để làm việc với lương nhân sự # route để làm việc với đơn từ
export function AuthResource(resourceName: string): MethodDecorator {
  return applyDecorators(SetMetadata(AUTH_RESOURCE, resourceName));
}

// gắn thông tin về quyền
export function AuthPolicy(scopeName: string): MethodDecorator {
  return applyDecorators(SetMetadata(AUTH_SCOPE, scopeName));
}

// Gộp cả 2 cái trên thành một decorator
export function AuthPermission(
  resourceName: string,
  scopeName: string,
): MethodDecorator {
  return applyDecorators(AuthResource(resourceName), AuthPolicy(scopeName));
}
