import { IsEnum, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLichLamViecRequestDto {
  @ApiProperty({
    example: 'USERCODE001',
    description: 'Mã nhân viên',
  })
  @IsNotEmpty()
  @MaxLength(200)
  userCode: string;

  @ApiProperty({
    example: new Date(),
    description: 'Ngày',
  })
  @IsNotEmpty()
  date: Date;

  @ApiProperty({
    example: 'SHIFT001',
    description: 'Mã ca làm',
  })
  @IsNotEmpty()
  @MaxLength(50)
  shiftCode: string;

  @ApiProperty({
    example: 'SHIFT001',
    description: 'Mã ca làm',
  })
  @IsNotEmpty()
  @MaxLength(50)
  branchCode: string;

  @ApiProperty({
    enum: ['NGAY', 'TUAN', 'THANG'],
    example: 'NGAY',
  })
  @IsNotEmpty()
  @IsEnum(['NGAY', 'TUAN', 'THANG'])
  optionCreate: 'NGAY' | 'TUAN' | 'THANG';
}
