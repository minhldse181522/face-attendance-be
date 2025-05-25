import { ValueObject } from '@src/libs/ddd';

export interface RequestUserProps {
  id: string;
  code: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  faceImg: string;
  dob: Date;
  gender: string;
  phone: string;
  typeOfWork: string;
  managedBy: string;
  isActive: boolean;
  roleCode: string;
  positionCode: string;
  addressCode: string;
}

export class RequestUser extends ValueObject<RequestUserProps> {
  get id(): string {
    return this.props.id;
  }

  get code(): string {
    return this.props.code;
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

  get dob(): Date {
    return this.props.dob;
  }

  get gender(): string {
    return this.props.gender;
  }

  get phone(): string {
    return this.props.phone;
  }

  get typeOfWork(): string {
    return this.props.typeOfWork;
  }

  get addressCode(): string {
    return this.props.addressCode;
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
