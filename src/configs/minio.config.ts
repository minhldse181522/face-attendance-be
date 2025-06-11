import '@libs/utils/dotenv';
import { get } from 'env-var';

export const minioConfig = {
  endPoint: get('MINIO_ENDPOINT').required().asString(),
  port: get('MINIO_PORT').asPortNumber(),
  useSSL: get('MINIO_USE_SSL').asBool(),
  accessKey: get('MINIO_ACCESS_KEY').required().asString(),
  secretKey: get('MINIO_SECRET_KEY').required().asString(),
  bucketName: get('MINIO_BUCKET').required().asString(),
};
