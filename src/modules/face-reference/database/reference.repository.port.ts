import { RepositoryPort } from '@libs/ddd';
import { DropDownResult } from '@src/libs/utils/dropdown.util';
import { FaceReferenceEntity } from '../domain/reference.entity';

export type FaceReferenceRepositoryPort = RepositoryPort<FaceReferenceEntity>;
