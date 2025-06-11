import { ApiProperty } from '@nestjs/swagger';

export class MoveObjectResponseDto {
  @ApiProperty({
    example:
      'https://minio-ecm.cehcloud.net/snp/TEMU8121621_CONT1234567/getin/survey_0/all/TEMU8121621_2.jpg',
    description: `URL ẢNH CŨ`,
  })
  oldUrl: string;

  @ApiProperty({
    example:
      'https://minio-ecm.cehcloud.net/snp/TEMU8121621_CONT123456/getin/survey_0/MOM505x25cm.HWR.TX7N.DT.RP.150.100.2/TEMU8121621_2.jpg',
    description: `URL ẢNH MỚI`,
  })
  newUrl: string;
}
