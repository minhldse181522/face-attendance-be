import { RepositoryPort } from '@libs/ddd';
import { TimeKeepingEntity } from '../domain/time-keeping.entity';

export type TimeKeepingRepositoryPort = RepositoryPort<TimeKeepingEntity>;
