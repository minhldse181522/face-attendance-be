import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class FindUserByBranchRequestDto {
  @ApiProperty({
    example: 'CN001',
    description: 'chi nhánh',
  })
  @IsNotEmpty()
  @MaxLength(50)
  branchCode: string;
}
