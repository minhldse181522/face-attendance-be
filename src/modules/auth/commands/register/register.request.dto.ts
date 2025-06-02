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

  @ApiProperty({
    example: 'test@gmail.com',
    description: 'Email',
  })
  @IsNotEmpty()
  @MaxLength(50)
  email: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Ảnh nhân sự',
  })
  @IsOptional()
  @MaxLength(200)
  faceImg?: string | null;

  @ApiProperty({
    example: new Date(),
    description: 'Ngày tháng năm sinh',
  })
  @IsNotEmpty()
  @IsDateString()
  dob: Date;

  @ApiProperty({
    example: 'M',
    description: 'Giới tính',
  })
  @IsNotEmpty()
  @MaxLength(2)
  gender: string;

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
  typeOfWork?: string | null;

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
    example: 'HAC',
    description: 'Mã chi nhánh',
  })
  @IsNotEmpty()
  @MaxLength(20)
  addressCode: string;
}
