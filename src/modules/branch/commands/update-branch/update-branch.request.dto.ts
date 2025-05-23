import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';

export class UpdateBranchRequestDto {
  @ApiPropertyOptional({
    example: 'CN001',
    description: 'Mã chi nhánh',
  })
  @IsOptional()
  @MaxLength(50)
  code?: string | null;

  @ApiPropertyOptional({
    example: 'Chi nhánh Hà Nội',
    description: 'Tên chi nhánh',
  })
  @IsOptional()
  @MaxLength(200)
  branchName?: string | null;
}
