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
  dob?: Date | null;

  @ApiPropertyOptional({
    example: 'M',
    description: 'Giới tính',
  })
  @IsOptional()
  @MaxLength(2)
  gender?: string | null;

  @ApiPropertyOptional({
    example: '0987654321',
    description: 'Số điện thoại',
  })
  @IsOptional()
  @MaxLength(10)
  phone?: string | null;

  @ApiPropertyOptional({
    example: 'part time',
    description: 'Type of work',
  })
  @IsOptional()
  @MaxLength(200)
  typeOfWork?: string | null;

  @ApiPropertyOptional({
    example: true,
    description: 'Trạng thái hoạt động',
  })
  @IsOptional()
  isActive?: boolean | null;

  @ApiPropertyOptional({
    example: 'R2',
    description: 'Mã vai trò',
  })
  @IsOptional()
  @MaxLength(5)
  roleCode?: string | null;

  @ApiPropertyOptional({
    example: 'HAC',
    description: 'Mã chi nhánh',
  })
  @IsOptional()
  @MaxLength(20)
  addressCode?: string | null;
}
