// import { DirectFilterPipe } from '@chax-at/prisma-filter';
// import { resourceScopes, resourcesV1 } from '@config/app.permission';
// import { routesV1 } from '@config/app.routes';
// import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
// import { QueryBus } from '@nestjs/cqrs';
// import {
//   ApiBearerAuth,
//   ApiOperation,
//   ApiResponse,
//   ApiTags,
// } from '@nestjs/swagger';
// import { Prisma } from '@prisma/client';
// import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
// import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';
// import { LichLamViecPaginatedResponseDto } from '../../dtos/lich-lam-viec.paginated.response.dto';
// import { LichLamViecMapper } from '../../mappers/bang-luong.mapper';
// import { FindLichLamViecQuery } from './find-bang-luong.query-handler';
// import { FindLichLamViecRequestDto } from './find-bang-luong.request.dto';

// @Controller(routesV1.version)
// export class FindLichLamViecHttpController {
//   constructor(
//     private readonly queryBus: QueryBus,
//     private readonly mapper: LichLamViecMapper,
//   ) {}
//   @ApiTags(
//     `${resourcesV1.BS_LICH_LAM_VIEC.parent} - ${resourcesV1.BS_LICH_LAM_VIEC.displayName}`,
//   )
//   @ApiOperation({ summary: 'Lấy danh sách lịch làm nhân viên' })
//   @ApiBearerAuth()
//   @ApiResponse({
//     status: HttpStatus.OK,
//     type: LichLamViecPaginatedResponseDto,
//   })
//   @AuthPermission(resourcesV1.BS_LICH_LAM_VIEC.name, resourceScopes.VIEW)
//   @UseGuards(JwtAuthGuard)
//   @Get(routesV1.businessLogic.lichLamViec.workingSchedule)
//   async findLichLamViec(
//     @Query(new DirectFilterPipe<any, Prisma.WorkingScheduleWhereInput>([]))
//     queryParams: FindLichLamViecRequestDto,
//   ): Promise<LichLamViecPaginatedResponseDto> {
//     const result = await this.queryBus.execute(
//       new FindLichLamViecQuery({
//         ...queryParams.findOptions,
//         fromDate: queryParams.fromDate,
//         toDate: queryParams.toDate,
//         userCode: queryParams.userCode,
//       }),
//     );

//     const paginated = result.unwrap();

//     return new LichLamViecPaginatedResponseDto({
//       ...paginated,
//       data: paginated.data.map(this.mapper.toLichLamViecResponse),
//     });
//   }
// }
