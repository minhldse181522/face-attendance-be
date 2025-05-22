import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { RoleCode } from '../../domain/role-code.enum';

export class RegisterRequestDto {
  @ApiProperty({
    example: 'utest',
    description: 'TÊN TÀI KHOẢN',
  })
  @IsNotEmpty()
  @MaxLength(50)
  userName: string;

  @ApiProperty({
    example: '123',
    description: 'MẬT KHẨU',
  })
  @IsNotEmpty()
  @MaxLength(100)
  password: string;

  @ApiProperty({
    example: RoleCode.ADMIN,
    enum: RoleCode,
    description:
      'MÃ QUYỀN: R1 - Admin, R2 - Staff, R3 - Manager, R4 - Customer',
  })
  @IsEnum(RoleCode, { message: 'roleCode must be one of R1, R2, R3, R4' })
  @IsNotEmpty()
  @MaxLength(5)
  roleCode: string;

  @ApiProperty({
    example: 'Pham',
    description: 'HỌ',
  })
  @IsNotEmpty()
  @MaxLength(20)
  firstName: string;

  @ApiProperty({
    example: 'Tu',
    description: 'TÊN',
  })
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Ảnh nhân sự',
  })
  @IsOptional()
  @MaxLength(200)
  faceImg?: string | null;

  @ApiProperty({
    example: 'test@gmail.com',
    description: 'Email',
  })
  @IsNotEmpty()
  @MaxLength(50)
  email: string;

  @ApiProperty({
    example: new Date(),
    description: 'Ngày tháng năm sinh',
  })
  @IsNotEmpty()
  @IsDateString()
  bod: Date;

  @ApiProperty({
    example: '129 Las Vegas',
    description: 'Địa chỉ',
  })
  @IsNotEmpty()
  @MaxLength(50)
  address: string;

  @ApiProperty({
    example: '0987654321',
    description: 'SĐT',
  })
  @IsNotEmpty()
  @MaxLength(10)
  phone: string;

  @ApiPropertyOptional({
    example: 'xxx.pdf',
    description: 'Hợp đồng',
  })
  @IsOptional()
  @MaxLength(200)
  contract?: string | null;

  @ApiProperty({
    example: 'HAC',
    description: 'Mã chi nhánh',
  })
  @IsNotEmpty()
  @MaxLength(20)
  branchCode: string;

  @ApiProperty({
    example: 'SEP',
    description: 'Mã nhân viên',
  })
  @IsNotEmpty()
  @MaxLength(20)
  positionCode: string;

  @ApiProperty({
    example: 'admin',
    description: 'Quản lý bởi',
  })
  @IsNotEmpty()
  @MaxLength(50)
  managedBy: string;
}
