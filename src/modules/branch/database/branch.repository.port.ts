import { RepositoryPort } from '@libs/ddd';
import { BranchEntity } from '../domain/branch.entity';

export type BranchRepositoryPort = RepositoryPort<BranchEntity>;
