import { ValueObject } from '@src/libs/ddd';

export interface RequestUserProps {
  id: string;
  userName: string;
  roleCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export class RequestUser extends ValueObject<RequestUserProps> {
  get id(): string {
    return this.props.id;
  }

  get userName(): string {
    return this.props.userName;
  }

  get roleCode(): string {
    return this.props.roleCode;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get email(): string {
    return this.props.email;
  }

  get phone(): string {
    return this.props.phone;
  }

  protected validate(props: RequestUserProps): void {
    void props;
  }
}
