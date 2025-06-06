import {
  ArgumentInvalidException,
  ArgumentNotProvidedException,
  ArgumentOutOfRangeException,
} from '../exceptions';
import { Guard } from '../guard';
import { convertPropsToObject } from '../utils';

// Định dang entity (UUID, bigint...).
export type EntityID = string | bigint;
export type AggregateID<A extends EntityID> = A;

// Các thuộc tính của entity
export interface BaseEntityProps<A extends EntityID> {
  id: AggregateID<A>;
  createdAt: Date;
  updatedAt: Date;
}

// Thuộc tính cơ bản của entity khi create
export interface CreateEntityProps<T, A extends EntityID> {
  id: AggregateID<A>;
  props: T;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export abstract class Entity<EntityProps, A extends EntityID> {
  // Nhận id, props, ngày tạo, cập nhật
  constructor({
    id,
    createdAt,
    updatedAt,
    props,
    skipValidation,
  }: CreateEntityProps<EntityProps, A> & { skipValidation?: boolean }) {
    this.setId(id);
    // Kiểm tra props ban đầu
    this.validateProps(props);
    const now = new Date();
    this._createdAt = createdAt || now;
    this._updatedAt = updatedAt || now;
    this.props = props;
    if (!skipValidation) this.validate();
  }

  // dữ liệu riêng của entity
  protected readonly props: EntityProps;

  /**
   * ID is set in the concrete entity implementation to support
   * different ID types depending on your needs.
   * For example it could be a UUID for aggregate root,
   * and shortid / nanoid for child entities.
   */
  protected abstract _id: AggregateID<A>;

  private readonly _createdAt: Date;

  private _updatedAt: Date;

  get id(): AggregateID<A> {
    return this._id;
  }

  private setId(id: AggregateID<A>): void {
    this._id = id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  static isEntity(entity: unknown): entity is Entity<unknown, EntityID> {
    return entity instanceof Entity;
  }

  /**
   *  Checks if two entities are the same Entity by comparing ID field.
   * @param object Entity
   */
  public equals(object?: Entity<EntityProps, A>): boolean {
    if (object === null || object === undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!Entity.isEntity(object)) {
      return false;
    }

    return this.id ? this.id === object.id : false;
  }

  /**
   * Returns entity properties.
   * @return {*}  {Props & EntityProps}
   * @memberof Entity
   */
  public getProps(): EntityProps & BaseEntityProps<A> {
    const propsCopy = {
      id: this._id,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      ...this.props,
    };
    return Object.freeze(propsCopy);
  }

  /**
   * Convert an Entity and all sub-entities/Value Objects it
   * contains to a plain object with primitive types. Can be
   * useful when logging an entity during testing/debugging
   */
  public toObject(): unknown {
    const plainProps = convertPropsToObject(this.props);

    const result = {
      id: this._id,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      ...plainProps,
    };
    return Object.freeze(result);
  }

  /**
   * There are certain rules that always have to be true (invariants)
   * for each entity. Validate method is called every time before
   * saving an entity to the database to make sure those rules are respected.
   */
  public abstract validate(): void;

  private validateProps(props: EntityProps): void {
    const MAX_PROPS = 160;

    if (Guard.isEmpty(props)) {
      throw new ArgumentNotProvidedException(
        'Entity props should not be empty',
      );
    }
    if (typeof props !== 'object') {
      throw new ArgumentInvalidException('Entity props should be an object');
    }
    if (Object.keys(props as any).length > MAX_PROPS) {
      throw new ArgumentOutOfRangeException(
        `Entity props should not have more than ${MAX_PROPS} properties`,
      );
    }
  }
}
