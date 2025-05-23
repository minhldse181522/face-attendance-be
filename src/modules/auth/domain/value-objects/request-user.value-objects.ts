import { ValueObject } from '@src/libs/ddd';

export interface RequestUserProps {
  id: string;
  userName: string;
  roleCode: string;
  firstName: string;
  lastName: string;
  faceImg: string;
  email: string;
  bod: Date;
  address: string;
  phone: string;
  contract: string;
  branchCode: string;
  positionCode: string;
  managedBy: string;
  isActive: boolean;
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

  get faceImg(): string {
    return this.props.faceImg;
  }

  get email(): string {
    return this.props.email;
  }

  get bod(): Date {
    return this.props.bod;
  }

  get address(): string {
    return this.props.address;
  }

  get phone(): string {
    return this.props.phone;
  }

  get contract(): string {
    return this.props.contract;
  }

  get branchCode(): string {
    return this.props.branchCode;
  }

  get positionCode(): string {
    return this.props.positionCode;
  }

  get managedBy(): string {
    return this.props.managedBy;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  protected validate(props: RequestUserProps): void {
    void props;
  }
}
