import { ResponseBase } from '@libs/api/response.base';
import { ApiProperty } from '@nestjs/swagger';

export class UserBranchResponseDto extends ResponseBase<any> {
  @ApiProperty({
    example: 'UB001',
    description: 'Mã phân công chi nhánh',
  })
  code?: string;

  @ApiProperty({
    example: 'BR001',
    description: 'Mã chi nhánh',
  })
  branchCode: string;

  @ApiProperty({
    example: 'CONT001',
    description: 'Mã hợp đồng người dùng',
    required: false,
    nullable: true,
  })
  userContractCode?: string | null;
}
