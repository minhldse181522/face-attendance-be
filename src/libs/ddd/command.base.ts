import { randomUUID } from 'crypto';
import { RequestContextService } from '@libs/application/context/AppRequestContext';
import { ArgumentNotProvidedException } from '../exceptions';
import { Guard } from '../guard';

// Cho phép truyền vào các thuộc tính và có thể kế thừa từ Command
export type CommandProps<T> = Omit<T, 'id' | 'metadata' | 'getExtendedProps'> &
  Partial<Command>;

// Truy xuất người gửi command, khi nào, ...
type CommandMetadata = {
  /** ID for correlation purposes (for commands that
   *  arrive from other microservices,logs correlation, etc). */
  readonly correlationId: string;

  /**
   * Causation id to reconstruct execution order if needed
   */
  readonly causationId?: string;

  /**
   * ID of a user who invoked the command. Can be useful for
   * logging and tracking execution of commands and events
   */
  readonly userId?: string;

  /**
   * Time when the command occurred. Mostly for tracing purposes
   */
  readonly timestamp: number;
};

export class Command {
  /**
   * Command id, in case if we want to save it
   * for auditing purposes and create a correlation/causation chain
   * ID duy nhất cho mỗi command
   */
  readonly id: string;

  readonly metadata: CommandMetadata;

  constructor(props: CommandProps<unknown>) {
    if (Guard.isEmpty(props)) {
      throw new ArgumentNotProvidedException(
        'Command props should not be empty',
      );
    }
    const ctx = RequestContextService.getContext();
    this.id = props.id || randomUUID();
    this.metadata = {
      correlationId: props?.metadata?.correlationId || ctx.requestId,
      causationId: props?.metadata?.causationId,
      timestamp: props?.metadata?.timestamp || Date.now(),
      userId: props?.metadata?.userId,
    };
  }

  // Lấy lại toàn bộ thuộc tính của command (ngoại trừ id, metadata, và trường tùy chọn)
  // Xử lý handler mà không cần biết class con cụ thể.
  getExtendedProps<T>(excludeFields: string[] = []): CommandProps<T> {
    // Exclude 'id' and 'metadata' by default, along with any additional fields
    const defaultExclusions = ['id', 'metadata'];
    const exclusions = [...defaultExclusions, ...excludeFields];

    const propsCopy = Object.keys(this)
      .filter((key) => !exclusions.includes(key))
      .reduce((acc, key) => {
        acc[key] = this[key];
        return acc;
      }, {});
    return Object.freeze(propsCopy) as CommandProps<T>;
  }
}
