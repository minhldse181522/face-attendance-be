import { RepositoryPort } from '@libs/ddd';
import { PositionEntity } from '../domain/position.entity';

export type PositionRepositoryPort = RepositoryPort<PositionEntity>;
