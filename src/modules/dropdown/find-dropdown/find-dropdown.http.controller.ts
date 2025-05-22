import { resourceScopes, resourcesV1 } from '@config/app.permission';
import { routesV1 } from '@config/app.routes';
import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';
import { DropDownResponseDto } from '../dtos/dropdown.response.dto';

import { DropDownTypeEnum } from '../database/dropdown.repository.prisma';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { FindDropdownQuery } from './find-dropdown.query-handler';

@Controller(routesV1.version)
export class DropDownHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  // User
  @ApiTags(
    `${resourcesV1.DROP_DOWN_DATA.parent} - ${resourcesV1.DROP_DOWN_DATA.displayName}`,
  )
  @ApiOperation({ summary: 'Danh sách user' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: DropDownResponseDto,
  })
  @AuthPermission(resourcesV1.DROP_DOWN_DATA.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.dropdown.user.root)
  async getUserDropdown(): Promise<DropDownResponseDto> {
    return this.queryBus.execute(new FindDropdownQuery(DropDownTypeEnum.USER));
  }

  // Position
  @ApiTags(
    `${resourcesV1.DROP_DOWN_DATA.parent} - ${resourcesV1.DROP_DOWN_DATA.displayName}`,
  )
  @ApiOperation({ summary: 'Danh sách vị trí' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: DropDownResponseDto,
  })
  @AuthPermission(resourcesV1.DROP_DOWN_DATA.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.dropdown.position.root)
  async getPositionDropdown(): Promise<DropDownResponseDto> {
    return this.queryBus.execute(
      new FindDropdownQuery(DropDownTypeEnum.POSITION),
    );
  }

  // Branch
  @ApiTags(
    `${resourcesV1.DROP_DOWN_DATA.parent} - ${resourcesV1.DROP_DOWN_DATA.displayName}`,
  )
  @ApiOperation({ summary: 'Danh sách chi nhánh' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: DropDownResponseDto,
  })
  @AuthPermission(resourcesV1.DROP_DOWN_DATA.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.dropdown.branch.root)
  async getBranchDropdown(): Promise<DropDownResponseDto> {
    return this.queryBus.execute(
      new FindDropdownQuery(DropDownTypeEnum.BRANCH),
    );
  }
}
