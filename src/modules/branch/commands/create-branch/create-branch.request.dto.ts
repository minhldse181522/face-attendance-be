import { IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBranchRequestDto {
  @ApiProperty({
    example: 'CN001',
    description: 'Mã chi nhánh',
  })
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({
    example: 'Chi nhánh Hà Nội',
    description: 'Tên chi nhánh',
  })
  @IsNotEmpty()
  @MaxLength(200)
  branchName: string;
}
