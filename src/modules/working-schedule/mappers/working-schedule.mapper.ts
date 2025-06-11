import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import {
  WorkingSchedule as WorkingScheduleModel,
  User as UserModel,
  UserContract as UserContractModel,
  Shift as ShiftModel,
  TimeKeeping as TimeKeepingModel,
  Branch as BranchModel,
} from '@prisma/client';
import { WorkingScheduleEntity } from '../domain/working-schedule.entity';
import { WorkingScheduleResponseDto } from '../dtos/working-schedule.response.dto';
import { UserEntity } from '@src/modules/user/domain/user.entity';
import { UserContractEntity } from '@src/modules/user-contract/domain/user-contract.entity';
import { ShiftEntity } from '@src/modules/shift/domain/shift.entity';
import { TimeKeepingEntity } from '@src/modules/time-keeping/domain/time-keeping.entity';
import { BranchEntity } from '@src/modules/branch/domain/branch.entity';

@Injectable()
export class WorkingScheduleMapper
  implements
    Mapper<
      WorkingScheduleEntity,
      WorkingScheduleModel,
      WorkingScheduleResponseDto
    >
{
  toPersistence(entity: WorkingScheduleEntity): WorkingScheduleModel {
    const copy = entity.getProps();
    const record: WorkingScheduleModel = {
      id: copy.id,
      code: copy.code || null,
      userCode: copy.userCode || null,
      userContractCode: copy.userContractCode || null,
      date: copy.date || null,
      shiftCode: copy.shiftCode || null,
      status: copy.status || null,
      branchCode: copy.branchCode || null,
      createdAt: copy.createdAt,
      createdBy: copy.createdBy,
      updatedAt: copy.updatedAt,
      updatedBy: copy.updatedBy || null,
    };

    return record;
  }

  toDomain(
    record: WorkingScheduleModel & {
      user?: UserModel;
      userContract?: UserContractModel;
      shift?: ShiftModel;
      timeKeeping?: TimeKeepingModel;
      branch?: BranchModel;
    },
  ): WorkingScheduleEntity {
    return new WorkingScheduleEntity({
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      props: {
        code: record.code || null,
        userCode: record.userCode || null,
        userContractCode: record.userContractCode || null,
        date: record.date || null,
        shiftCode: record.shiftCode || null,
        status: record.status || null,
        branchCode: record.branchCode || null,
        createdBy: record.createdBy,
        updatedBy: record.updatedBy,
        user: record.user
          ? new UserEntity({
              id: record.user.id,
              props: {
                code: record.user.code,
                userName: record.user.userName,
                password: record.user.password,
                firstName: record.user.firstName,
                lastName: record.user.lastName,
                email: record.user.email,
                gender: record.user.gender,
                dob: record.user.dob,
                phone: record.user.phone,
                isActive: record.user.isActive,
                roleCode: record.user.roleCode,
                createdBy: record.user.createdBy,
              },
            })
          : undefined,
        userContract: record.userContract
          ? new UserContractEntity({
              id: record.userContract.id,
              props: {
                code: record.userContract.code,
                title: record.userContract.title,
                description: record.userContract.description,
                startTime: record.userContract.startTime,
                endTime: record.userContract.endTime,
                duration: record.userContract.duration,
                contractPdf: record.userContract.contractPdf,
                status: record.userContract.status,
                userCode: record.userContract.userCode,
                managedBy: record.userContract.managedBy,
                positionCode: record.userContract.positionCode,
                createdBy: record.userContract.createdBy,
              },
            })
          : undefined,
        shift: record.shift
          ? new ShiftEntity({
              id: record.shift.id,
              props: {
                code: record.shift.code,
                name: record.shift.name,
                startTime: record.shift.startTime,
                endTime: record.shift.endTime,
                workingHours: record.shift.workingHours,
                delayTime: record.shift.delayTime,
                createdBy: record.shift.createdBy,
              },
            })
          : undefined,
        timeKeeping: record.timeKeeping
          ? new TimeKeepingEntity({
              id: record.timeKeeping.id,
              props: {
                code: record.timeKeeping.code,
                checkInTime: record.timeKeeping.checkInTime,
                checkOutTime: record.timeKeeping.checkOutTime,
                date: record.timeKeeping.date,
                status: record.timeKeeping.status,
                userCode: record.timeKeeping.userCode,
                workingScheduleCode: record.timeKeeping.workingScheduleCode,
                createdBy: record.timeKeeping.createdBy,
              },
            })
          : undefined,
        branch: record.branch
          ? new BranchEntity({
              id: record.branch.id,
              props: {
                code: record.branch.code,
                branchName: record.branch.branchName,
                addressLine: record.branch.addressLine,
                placeId: record.branch.placeId,
                city: record.branch.city,
                district: record.branch.district,
                lat: record.branch.lat,
                long: record.branch.long,
                companyCode: record.branch.companyCode,
                createdBy: record.branch.createdBy,
              },
            })
          : undefined,
      },
      skipValidation: true,
    });
  }

  toResponse(entity: WorkingScheduleEntity): WorkingScheduleResponseDto {
    const props = entity.getProps();
    const response = new WorkingScheduleResponseDto(entity);
    response.code = props.code;
    response.userCode = props.userCode;
    response.userContractCode = props.userContractCode;
    response.date = props.date;
    response.shiftCode = props.shiftCode;
    response.status = props.status;
    response.branchCode = props.branchCode;
    return response;
  }
}
