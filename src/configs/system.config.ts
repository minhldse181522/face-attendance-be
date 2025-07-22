import '@libs/utils/dotenv';
import { get } from 'env-var';

export const systemConfig = {
  env: get('NODE_ENV').default('development').asString(),
  port: get('PORT').default('3001').asPortNumber(),
  socketPort: get('SOCKET_PORT').default('4001').asPortNumber(),
  bodySizeLimit: 50 * 1024 * 1024, // Fixed 50MB
  uploadFileSize: 50 * 1024 * 1024, // Fixed 50MB for file uploads
  uploadRateLimit: get('UPLOAD_RATE_LIMIT').default(24).asIntPositive(),
};
