import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { Branch as BranchModel } from '@prisma/client';
import { BranchEntity } from '../domain/branch.entity';
import { BranchResponseDto } from '../dtos/branch.response.dto';

@Injectable()
export class BranchMapper
  implements Mapper<BranchEntity, BranchModel, BranchResponseDto>
{
  toPersistence(entity: BranchEntity): BranchModel {
    const copy = entity.getProps();
    const record: BranchModel = {
      id: copy.id,
      // Map entity properties to record
      code: copy.code,
      branchName: copy.branchName,
      addressLine: copy.addressLine,
      placeId: copy.placeId,
      city: copy.city,
      district: copy.district,
      lat: copy.lat,
      long: copy.long,
      companyCode: copy.companyCode,
      createdAt: copy.createdAt,
      createdBy: copy.createdBy,
      updatedAt: copy.updatedAt,
      updatedBy: copy.updatedBy || null,
    };

    return record;
  }

  toDomain(record: BranchModel): BranchEntity {
    return new BranchEntity({
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      props: {
        // Map record properties to entity
        code: record.code,
        branchName: record.branchName,
        addressLine: record.addressLine,
        placeId: record.placeId,
        city: record.city,
        district: record.district,
        lat: record.lat,
        long: record.long,
        companyCode: record.companyCode,
        createdBy: record.createdBy,
        updatedBy: record.updatedBy,
      },
      skipValidation: true,
    });
  }

  toResponse(entity: BranchEntity): BranchResponseDto {
    const props = entity.getProps();
    const response = new BranchResponseDto(entity);
    // Map entity properties to response DTO
    response.code = props.code;
    response.branchName = props.branchName;
    response.addressLine = props.addressLine;
    response.placeId = props.placeId;
    response.city = props.city;
    response.district = props.district;
    response.lat = props.lat;
    response.long = props.long;
    response.companyCode = props.companyCode;
    return response;
  }
}
