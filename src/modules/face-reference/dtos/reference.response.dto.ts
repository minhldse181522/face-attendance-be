import { ResponseBase } from '@libs/api/response.base';
import { ApiProperty } from '@nestjs/swagger';

export class FaceReferenceResponseDto extends ResponseBase<any> {
  @ApiProperty({
    example: '',
    description: 'Mã',
  })
  code: string;

  @ApiProperty({
    example: '',
    description: 'Ảnh',
  })
  faceImg: string;

  @ApiProperty({
    example: '',
    description: 'Mã nhân viên',
  })
  userCode: string;
}
