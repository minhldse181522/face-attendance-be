import '@libs/utils/dotenv';
import { get } from 'env-var';

export const systemConfig = {
  env: get('NODE_ENV').default('development').asString(),
  port: get('PORT').default('3001').asPortNumber(),
  socketPort: get('SOCKET_PORT').default('4001').asPortNumber(),
  bodySizeLimit: get('BODY_SIZE_LIMIT')
    .default(25 * 1024 * 1024)
    .asIntPositive(),
  uploadRateLimit: get('UPLOAD_RATE_LIMIT').default(24).asIntPositive(),
};
