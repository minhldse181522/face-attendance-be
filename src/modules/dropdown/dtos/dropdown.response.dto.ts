import { ApiProperty } from '@nestjs/swagger';

export class DropDownResponseDto {
  @ApiProperty({
    example: 'label',
    description: 'Label',
  })
  label: string;

  @ApiProperty({
    example: 'value',
    description: 'Value',
  })
  value: string;
}
