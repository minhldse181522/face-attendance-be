import { randomUUID } from 'crypto';
import { RequestContextService } from '@libs/application/context/AppRequestContext';
import { ArgumentNotProvidedException } from '../exceptions';
import { Guard } from '../guard';
import { EntityID } from './entity.base';

type DomainEventMetadata = {
  /** Timestamp when this domain event occurred */
  readonly timestamp: number;

  /** ID for correlation purposes (for Integration Events,logs correlation, etc).
   */
  readonly correlationId: string;

  /**
   * Causation id used to reconstruct execution order if needed
   */
  readonly causationId?: string;

  /**
   * User ID for debugging and logging purposes
   */
  readonly userId?: string;
};

export type DomainEventProps<T, A extends EntityID = string> = Omit<
  T,
  'id' | 'metadata'
> & {
  aggregateId: A;
  metadata?: DomainEventMetadata;
};

export abstract class DomainEvent<A extends EntityID> {
  public readonly id: string;

  /** Aggregate ID where domain event occurred */
  public readonly aggregateId: A;

  public readonly metadata: DomainEventMetadata;

  constructor(props: DomainEventProps<unknown, A>) {
    if (Guard.isEmpty(props)) {
      throw new ArgumentNotProvidedException(
        'DomainEvent props should not be empty',
      );
    }
    this.id = randomUUID();
    this.aggregateId = props.aggregateId;
    this.metadata = {
      correlationId:
        props?.metadata?.correlationId || RequestContextService.getRequestId(),
      causationId: props?.metadata?.causationId,
      timestamp: props?.metadata?.timestamp || Date.now(),
      userId: props?.metadata?.userId,
    };
  }
}
