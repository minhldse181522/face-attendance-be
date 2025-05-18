import { ApiProperty } from '@nestjs/swagger';
import { EntityID } from '../ddd';

export class IdResponse<A extends EntityID> {
  constructor(id: A) {
    // if A is a string, we can use it as is, otherwise we need to convert it to a string
    this.id = typeof id === 'string' ? id : id.toString();
  }

  @ApiProperty({ example: '1' })
  readonly id: string;
}
