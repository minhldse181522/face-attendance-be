import { PartialType } from '@nestjs/swagger';
import { CreateWorkingScheduleRequestDto } from '../create-working-schedule/create-working-schedule.request.dto';

export class UpdateWorkingScheduleRequestDto extends PartialType(
  CreateWorkingScheduleRequestDto,
) {
  // Add more properties here
}
