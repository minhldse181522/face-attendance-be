export interface MinioOptions {
  endPoint: string;
  port?: number;
  useSSL?: boolean;
  accessKey: string;
  secretKey: string;
  bucketName: string;
  publicEndPoint: string;
}
