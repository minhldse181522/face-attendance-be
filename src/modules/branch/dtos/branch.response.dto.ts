import { ResponseBase } from '@libs/api/response.base';
import { ApiProperty } from '@nestjs/swagger';

export class BranchResponseDto extends ResponseBase<any> {
  @ApiProperty({
    example: 'CN001',
    description: 'Mã chi nhánh',
  })
  code: string;

  @ApiProperty({
    example: 'Chi nhánh Hà Nội',
    description: 'Tên chi nhánh',
  })
  branchName: string;
}
