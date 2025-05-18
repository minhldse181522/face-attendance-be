import { ValueObject } from '@src/libs/ddd';

export interface RequestUserProps {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dob: Date;
}

export class RequestUser extends ValueObject<RequestUserProps> {
  get id(): string {
    return this.props.id;
  }

  get username(): string {
    return this.props.username;
  }

  get email(): string {
    return this.props.email;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  // get yardId(): string[] {
  //   return this.props.yardId || [];
  // }

  protected validate(props: RequestUserProps): void {
    void props;
  }
}
