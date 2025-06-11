// import { minioConfig } from '@config/minio.config';
// import { CacheService } from '@libs/cache/cache.service';
// import { MinioService } from '@libs/minio/minio.service';
// import { CommandBus, CommandHandler } from '@nestjs/cqrs';
// import { CreateSignedUrlCommand } from './create-signed-url.command';
// import { CreateSignedUrlResponseDto } from './create-signed-url.response.dto';


// @CommandHandler(CreateSignedUrlCommand)
// export class CreateSignedUrlService {
//   constructor(
//     private readonly minIoService: MinioService,
//     private readonly cacheService: CacheService,
//     private readonly commandBus: CommandBus,
//   ) {}

//   async execute(
//     command: CreateSignedUrlCommand,
//   ): Promise<CreateSignedUrlResponseDto[]> {
//     const bucketName = minioConfig.bucketName;
//     const results: CreateSignedUrlResponseDto[] = [];

//     // Xử lý từng fileUpload trong command
//     for (const fileUploadItem of command.fileUpload) {
//       const { soTn, files } = fileUploadItem;
//       // const keyNumber = `${bucketName}/${soTnFilePath}/`;

//       // Xử lý từng file trong files array
//       for (let i = 0; i < files.length; i++) {
//         const file = files[i];
//         // const indexFile = await this.cacheService.incr(keyNumber);

//         // Get file extension from mimetype or original filename
//         // const fileExtension = this.getFileExtension(
//         //   file.mimetype,
//         //   file.originalname,
//         // );
//         const fileName = file.filename || file.originalname;
//         // Tạo key cho object trong MinIO
//         const key = `${soTn}/${fileName}`;

//         await this.minIoService.publicUrl();
//         const url = await this.minIoService.getPresignedPutUrl(
//           key,
//           24 * 60 * 60,
//         );

//         // Upload file lên MinIO
//         const objectsStream = await this.minIoService.getListObject(
//           soTn,
//           false,
//         );

//         for await (const obj of objectsStream) {
//           await this.minIoService.remove(obj);
//         }

//         await this.minIoService.putObject(key, file.buffer, file.size, {
//           'content-type': file.mimetype,
//         });

//         //Lưu trữ vào db
//         await this.commandBus.execute(
//           new CreateDtPathFileCommand({
//             soTn: soTn,
//             tenFile: fileName,
//             filePath: `${soTn}/${fileName}`,
//             createdBy: command.createdBy ?? 'CAS',
//           }),
//         );

//         // Thêm kết quả vào mảng results
//         results.push({
//           indexUrl: i + 1,
//           path: key,
//           name: `${fileName}`,
//           signedUrl: url,
//         });
//       }
//     }

//     return results;
//   }

//   /**
//    * Get file extension based on mimetype or original filename
//    * @param mimetype The file's mimetype
//    * @param originalname The original filename
//    * @returns The file extension with dot prefix (e.g., '.pdf')
//    */
//   private getFileExtension(mimetype: string, originalname: string): string {
//     // Try to get extension from original filename first
//     if (originalname && originalname.includes('.')) {
//       const parts = originalname.split('.');
//       return `.${parts[parts.length - 1]}`;
//     }

//     // Map common mimetypes to extensions
//     const mimeToExt: Record<string, string> = {
//       'image/jpeg': '.jpg',
//       'image/png': '.png',
//       'image/gif': '.gif',
//       'image/webp': '.webp',
//       'image/svg+xml': '.svg',
//       'application/pdf': '.pdf',
//       'application/msword': '.doc',
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
//         '.docx',
//       'application/vnd.ms-excel': '.xls',
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
//         '.xlsx',
//       'text/csv': '.csv',
//       'application/xml': '.xml',
//       'text/xml': '.xml',
//       'text/plain': '.txt',
//     };

//     return mimeToExt[mimetype] || '';
//   }
// }
