import { PositionEntity } from '@src/modules/position/domain/position.entity';
import { UserEntity } from '@src/modules/user/domain/user.entity';

export interface FaceReferenceProps {
  id?: bigint;
  // Add properties here
  code: string;
  faceImg: string;
  userCode: string;
  createdBy: string;
  updatedBy?: string | null;
  inUseCount?: number;

  user?: UserEntity;
}
export interface CreateFaceReferenceProps {
  // Add properties here
  code: string;
  faceImg: string;
  userCode: string;
  createdBy: string;
}

export interface UpdateFaceReferenceProps {
  // Add properties here
  code?: string | null;
  faceImg?: string | null;
  userCode?: string | null;
  updatedBy: string | null;
}
