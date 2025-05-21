import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsOptional, MaxLength } from 'class-validator';

export class UpdateUserRequestDto {
  @ApiPropertyOptional({
    example: 'utest',
    description: 'TÊN TÀI KHOẢN',
  })
  @IsOptional()
  @MaxLength(50)
  userName?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(5)
  roleCode?: string | null;

  @ApiPropertyOptional({
    example: 'Pham',
    description: 'HỌ',
  })
  @IsOptional()
  @MaxLength(50)
  firstName?: string | null;

  @ApiPropertyOptional({
    example: 'Tu',
    description: 'TÊN',
  })
  @IsOptional()
  @MaxLength(50)
  lastName?: string | null;

  @ApiPropertyOptional({
    example: '',
    description: 'Ảnh nhân sự',
  })
  @IsOptional()
  @MaxLength(200)
  faceImg?: string | null;

  @ApiPropertyOptional({
    example: 'test@gmail.com',
    description: 'Email',
  })
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional({
    example: new Date(),
    description: 'Ngày tháng năm sinh',
  })
  @IsOptional()
  @IsDateString()
  bod?: Date | null;

  @ApiPropertyOptional()
  @IsOptional()
  address?: string | null;

  @ApiPropertyOptional({
    example: '129 Las Vegas',
    description: 'Địa chỉ',
  })
  @IsOptional()
  @MaxLength(10)
  phone?: string | null;

  @ApiPropertyOptional({
    example: 'xxx.pdf',
    description: 'Hợp đồng',
  })
  @IsOptional()
  @MaxLength(200)
  contract?: string | null;

  @ApiPropertyOptional({
    example: 'HAC',
    description: 'Mã chi nhánh',
  })
  @IsOptional()
  @MaxLength(20)
  branchCode?: string | null;

  @ApiPropertyOptional({
    example: 'admin',
    description: 'Quản lý bởi',
  })
  @IsOptional()
  @MaxLength(50)
  managedBy?: string | null;
}
