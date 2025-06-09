import { RepositoryPort } from '@libs/ddd';
import { ShiftEntity } from '../domain/shift.entity';

export type ShiftRepositoryPort = RepositoryPort<ShiftEntity>;
