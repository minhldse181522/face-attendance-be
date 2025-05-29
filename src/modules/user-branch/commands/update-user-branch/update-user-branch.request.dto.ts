import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';

export class UpdateUserBranchRequestDto {
  @ApiPropertyOptional({
    example: 'BR001',
    description: 'Mã chi nhánh',
  })
  @IsOptional()
  @MaxLength(50)
  branchCode?: string | null;

  @ApiPropertyOptional({
    example: 'CONT001',
    description: 'Mã hợp đồng người dùng',
  })
  @IsOptional()
  @MaxLength(50)
  userContractCode?: string | null;
}
