import { PartialType } from '@nestjs/swagger';
import { CreateTimeKeepingRequestDto } from '../create-time-keeping/create-time-keeping.request.dto';

export class UpdateTimeKeepingRequestDto extends PartialType(
  CreateTimeKeepingRequestDto,
) {
  // Add more properties here
}
