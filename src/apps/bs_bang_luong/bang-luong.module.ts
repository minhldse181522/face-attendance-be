// import { Logger, Module, Provider } from '@nestjs/common';
// import { CqrsModule } from '@nestjs/cqrs';
// import { GenerateCode } from '@src/libs/utils/generate-code.util';
// import { GenerateWorkingDate } from '@src/libs/utils/generate-working-dates.util';
// import { ShiftModule } from '@src/modules/shift/shift.module';
// import { UserContractModule } from '@src/modules/user-contract/user-contract.module';
// import { PrismaWorkingScheduleRepository } from '@src/modules/working-schedule/database/working-schedule.repository.prisma';
// import { WORKING_SCHEDULE_REPOSITORY } from '@src/modules/working-schedule/working-schedule.di-tokens';
// import { WorkingScheduleModule } from '@src/modules/working-schedule/working-schedule.module';
// import { BANG_LUONG_REPOSITORY } from './bang-luong.di-tokens';
// import { ChamCongHttpController } from './commands/tinh-bang-luong/tinh-bang-luong.http.controller';
// import { UpdateChamCongService } from './commands/tinh-bang-luong/tinh-bang-luong.service';
// import { BangLuongRepository } from './database/bang-luong.repository.prisma';
// import { BangLuongMapper } from './mappers/bang-luong.mapper';
// import { FindLichLamViecHttpController } from './queries/find-bang-luong/find-bang-luong.http.controller';
// import { FindLichLamViecQueryHandler } from './queries/find-bang-luong/find-bang-luong.query-handler';

// const httpControllers = [FindLichLamViecHttpController, ChamCongHttpController];

// const messageControllers = [];

// const cliControllers: Provider[] = [];

// const graphqlResolvers: Provider[] = [];

// const commandHandlers: Provider[] = [UpdateChamCongService];

// const queryHandlers: Provider[] = [FindLichLamViecQueryHandler];

// const mappers: Provider[] = [BangLuongMapper];

// const repositories: Provider[] = [
//   {
//     provide: BANG_LUONG_REPOSITORY,
//     useClass: BangLuongRepository,
//   },
//   {
//     provide: WORKING_SCHEDULE_REPOSITORY,
//     useClass: PrismaWorkingScheduleRepository,
//   },
// ];

// const utilities: Provider[] = [GenerateCode, GenerateWorkingDate];

// @Module({
//   imports: [CqrsModule, UserContractModule, ShiftModule, WorkingScheduleModule],
//   controllers: [...httpControllers, ...messageControllers],
//   providers: [
//     Logger,
//     ...cliControllers,
//     ...repositories,
//     ...graphqlResolvers,
//     ...commandHandlers,
//     ...queryHandlers,
//     ...mappers,
//     ...utilities,
//   ],
//   exports: [...repositories, ...mappers],
// })
// export class LichLamViecModule {}
