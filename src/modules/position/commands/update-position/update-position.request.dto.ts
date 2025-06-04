import { PartialType } from '@nestjs/swagger';
import { CreatePositionRequestDto } from '../create-position/create-position.request.dto';

export class UpdatePositionRequestDto extends PartialType(
  CreatePositionRequestDto,
) {
  // Add more properties here
}
