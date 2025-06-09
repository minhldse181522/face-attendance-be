import { PartialType } from '@nestjs/swagger';
import { CreateShiftRequestDto } from '../create-shift/create-shift.request.dto';

export class UpdateShiftRequestDto extends PartialType(CreateShiftRequestDto) {
  // Add more properties here
}
