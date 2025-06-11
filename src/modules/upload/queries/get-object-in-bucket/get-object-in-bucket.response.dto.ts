import { ApiProperty } from '@nestjs/swagger';

export class GetObjectInBucketResponseDto {
  @ApiProperty({
    example:
      'https://minio-vasscm.cehcloud.net/vasscm/ABC123/ABC1231',
    description: `URL ẢNH`,
  })
  urlFile: string;

  @ApiProperty({
    example:
      'vasscm/ABC123/ABC1231',
    description: `PATH`,
  })
  path: string;

  @ApiProperty({
    example: 'ABC1231.jpg',
    description: `TÊN ẢNH`,
  })
  nameFile: string;

  @ApiProperty({
    example: '',
    description: `THÔNG TIN ẢNH`,
  })
  infoFile: object;
}
