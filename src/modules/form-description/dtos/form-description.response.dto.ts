import { ResponseBase } from '@libs/api/response.base';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FormDescriptionResponseDto extends ResponseBase<any> {
  @ApiProperty({
    example: 'FORM-001',
    description: 'Mã đơn',
  })
  code: string;

  @ApiProperty({
    example: 'Lý do xin nghỉ phép',
    description: 'Lý do',
  })
  reason: string;

  @ApiProperty({
    example: 'OKE',
    description: 'Phản hồi',
  })
  response?: string | null;

  @ApiProperty({
    example: 'PENDING',
    description: 'Trạng thái đơn',
  })
  status: string;

  @ApiProperty({
    example: 'PENDING',
    description: 'Trạng thái đơn',
  })
  statusOvertime?: boolean | null;

  @ApiPropertyOptional({
    example: 'file_upload.pdf',
    description: 'Tệp đính kèm',
  })
  file?: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Thời gian bắt đầu',
  })
  startTime: Date;

  @ApiProperty({
    example: '2023-01-02T00:00:00.000Z',
    description: 'Thời gian kết thúc',
  })
  endTime: Date;

  @ApiPropertyOptional({
    example: '2023-01-01T12:00:00.000Z',
    description: 'Thời gian phê duyệt',
  })
  approvedTime?: Date;

  // @ApiProperty({
  //   example: 1,
  //   description: 'ID của form',
  // })
  // formId: bigint;

  @ApiProperty({
    example: 'Đơn xin nghỉ phép',
    description: 'Tên biểu mẫu',
  })
  formTitle: string;

  @ApiProperty({
    example: 'USER001',
    description: 'Mã người gửi đơn',
  })
  submittedBy: string;

  @ApiPropertyOptional({
    example: 'MANAGER001',
    description: 'Mã người phê duyệt đơn',
  })
  approvedBy?: string;
}
