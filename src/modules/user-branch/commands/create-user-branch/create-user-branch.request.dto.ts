import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserBranchRequestDto {
  @ApiProperty({
    example: 'BR001',
    description: 'Mã chi nhánh',
  })
  @IsNotEmpty()
  @MaxLength(50)
  branchCode: string;

  @ApiPropertyOptional({
    example: 'CONT001',
    description: 'Mã hợp đồng người dùng',
  })
  @IsOptional()
  @MaxLength(50)
  userContractCode?: string;
}
