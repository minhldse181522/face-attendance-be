import { JsonValue } from '@prisma/client/runtime/library';

export interface ImageStorageProps {
  id?: bigint;
  idCont: string;
  containerNo: string;
  operationCode: string;
  jobTask: string;
  jobType: string;
  jobDate: Date;
  detail: JsonValue;

  createdBy: string;
  updatedBy?: string | null;
}

export interface CreateImageStorageProps {
  idCont: string;
  containerNo: string;
  operationCode: string;
  jobTask: string;
  jobType: string;
  jobDate: Date;
  detail: JsonValue;

  createdBy: string;
}

export interface UpdateImageStorageProps {
  jobDate?: Date;
  detail?: JsonValue;

  updatedBy: string;
}
