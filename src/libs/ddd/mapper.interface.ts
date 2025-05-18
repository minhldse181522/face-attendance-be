import { Entity } from './entity.base';

export interface Mapper<
  DomainEntity extends Entity<any, any>,
  DbRecord,
  Response = any,
> {
  toPersistance(entity: DomainEntity): DbRecord;
  toDomain(record: any): DomainEntity;
  toResponse(entity: DomainEntity): Response;

  toPersisenceFromRaw?(copy: any): DbRecord;
}
