import { ResponseBase } from '@libs/api/response.base';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { JsonValue } from '@prisma/client/runtime/library';

export class ImageStorageResponseDto extends ResponseBase<any> {
  @ApiPropertyOptional({
    example: 'CONT123456',
    description: 'VÒNG ĐỜI CONTAINER',
  })
  idCont?: string;

  @ApiProperty({
    example: 'TEMU8121621',
    description: 'SỐ CONTAINER',
  })
  containerNo: string;

  @ApiProperty({
    example: '',
    description: 'CKT',
  })
  operationCode: string;

  @ApiProperty({
    example: 'getin',
    description: `LOẠI CÔNG VIỆC`,
  })
  jobTask: string;

  @ApiProperty({
    example: 'clean',
    description: `LOẠI TÁC NGHIỆP`,
  })
  jobType: string;

  @ApiProperty({
    example: new Date(),
    description: 'NGÀY TÁC NGHIỆP',
  })
  jobDate: Date;

  @ApiProperty({
    example: {
      '0': [
        {
          side: 'all',
          nameImage: ['TEMU8121621_1.jpg', 'TEMU8121621_2.jpg'],
        },
        {
          side: '%MOM505x20cm.HWR.TX7N.DT.RP.150.100.2',
          nameImage: ['TEMU8121621_1.jpg', 'TEMU8121621_2.jpg'],
        },
        {
          side: '%MOM505x20cm.AAA.BBB.DT.RP.150.100.2',
          nameImage: ['TEMU8121621_1.jpg', 'TEMU8121621_2.jpg'],
        },
      ],
      '0_1': [
        {
          side: '%MOM505x20cm.HWR.TX7N.DT.RP.150.100.2',
          nameImage: ['TEMU8121621_1.jpg', 'TEMU8121621_2.jpg'],
        },
      ],
    },
    description: 'Detail of images and sides',
  })
  detail: JsonValue;
}
