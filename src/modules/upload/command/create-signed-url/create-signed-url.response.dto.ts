import { ApiProperty } from '@nestjs/swagger';

export class CreateSignedUrlResponseDto {
  @ApiProperty({
    example: 1,
    description: `INDEX URL`,
  })
  indexUrl: number;

  @ApiProperty({
    example:
      'vasscm/ABC123/ABC1231',
    description: `PATH`,
  })
  path: string;

  @ApiProperty({
    example: 'ABC1231',
    description: `TÊN FILE`,
  })
  name: string;

  @ApiProperty({
    example:
      'https://minio-vasscm.cehcloud.net/vasscm/ABC123/ABC1231',
    description: `LINK FILE`,
  })
  signedUrl: string;
}
