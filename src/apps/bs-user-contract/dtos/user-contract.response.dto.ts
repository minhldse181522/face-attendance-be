import { ResponseBase } from '@libs/api/response.base';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserContractResponseDto extends ResponseBase<any> {
  @ApiProperty({
    example: 'CONTRACT001',
    description: 'Mã hợp đồng',
    nullable: true,
  })
  code?: string | null;

  @ApiProperty({
    example: 'Hợp đồng lao động',
    description: 'Tiêu đề hợp đồng',
    nullable: true,
  })
  title?: string | null;

  @ApiProperty({
    example: 'Mô tả chi tiết về hợp đồng lao động',
    description: 'Mô tả hợp đồng',
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Thời gian bắt đầu',
    nullable: true,
  })
  startTime?: Date | null;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Thời gian kết thúc',
    nullable: true,
  })
  endTime?: Date | null;

  @ApiProperty({
    example: '1 năm',
    description: 'Thời hạn hợp đồng',
    nullable: true,
  })
  duration?: string | null;

  @ApiProperty({
    example: '/uploads/contracts/contract001.pdf',
    description: 'Đường dẫn đến file PDF hợp đồng',
    nullable: true,
  })
  contractPdf?: string | null;

  @ApiProperty({
    example: 'ACTIVE',
    description: 'Trạng thái hợp đồng',
    nullable: true,
  })
  status?: string | null;

  @ApiProperty({
    example: 'USER001',
    description: 'Mã người dùng',
    nullable: true,
  })
  userCode?: string | null;

  @ApiProperty({
    example: 'admin',
    description: 'Quản lý bởi (người quản lý)',
    nullable: true,
  })
  managedBy?: string | null;

  @ApiProperty({
    example: 'MGR',
    description: 'Mã vị trí',
    nullable: true,
  })
  positionCode?: string | null;
  @ApiProperty({
    example: 'Nhân viên chăm sóc khách hàng',
    description: 'Tên vị trí',
    nullable: true,
  })
  positionName?: string | null;

  @ApiProperty({
    example: ['BRANCH001', 'BRANCH002'],
    description: 'Mảng mã chi nhánh',
    nullable: true,
    isArray: true,
    type: String,
  })
  branchCodes?: string[] | null;

  @ApiPropertyOptional({
    example: 'Chi nhánh A, Chi nhánh B',
    description: 'Tên các chi nhánh',
    nullable: true,
  })
  branchNames?: string | null;
  @ApiPropertyOptional({
    example: 'Pham Van A',
    description: 'Tên đầy đủ của người dùng',
    nullable: true,
  })
  fullName?: string | null;
  @ApiPropertyOptional({
    example: 'Pham Van A',
    description: 'Tên đầy đủ của người dùng',
    nullable: true,
  })
  fullNameManager?: string | null;
  @ApiPropertyOptional({
    example: '',
    description: 'Lương cơ bản',
  })
  baseSalary?: number | null;
}
