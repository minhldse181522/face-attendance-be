import { QueryHandler } from '@nestjs/cqrs';
import { minioConfig } from '@src/configs/minio.config';
import { MinioService } from '@src/libs/minio/minio.service';
import { GetObjectInBucketResponseDto } from './get-object-in-bucket.response.dto';
export class GetObjectInBucketQuery {
  soTn: string;

  constructor(public readonly sotn: string) {
    this.soTn = sotn;
  }
}

@QueryHandler(GetObjectInBucketQuery)
export class GetObjectInBucketService {
  constructor(private readonly minIoService: MinioService) {}

  async execute(
    query: GetObjectInBucketQuery,
  ): Promise<GetObjectInBucketResponseDto[]> {
    const bucketName = minioConfig.bucketName;
    // const minioHostGetImage = this.minIoService.getPublicEndpoint();

    const results: GetObjectInBucketResponseDto[] = [];

    if (query.soTn) {
      const prefix = `${query.soTn}`;
      const rs = await this.minIoService.getListObject(prefix, true);

      for (let i = 0; i < rs.length; i++) {
        const path = rs[i];
        const infoImage = await this.minIoService.getInfoObject(path);
        const result = '';
        // const result = `${minioHostGetImage}/${bucketName}/${rs[i]}`;
        const splitObject = rs[i].split('/');

        const nameImage = splitObject[splitObject.length - 1];
        results.push({ urlFile: result, nameFile: nameImage, path, infoFile: infoImage });
      }
    }
    return results;
  }
}
