import { RepositoryPort } from '@libs/ddd';
import { WorkingScheduleEntity } from '../domain/working-schedule.entity';

export type WorkingScheduleRepositoryPort =
  RepositoryPort<WorkingScheduleEntity>;
