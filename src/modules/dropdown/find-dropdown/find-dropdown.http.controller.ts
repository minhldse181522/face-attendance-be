import { resourceScopes, resourcesV1 } from '@config/app.permission';
import { routesV1 } from '@config/app.routes';
import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';
import { DropDownResponseDto } from '../dtos/dropdown.response.dto';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { DropDownTypeEnum } from '../database/dropdown.repository.prisma';
import { FindDropdownQuery } from './find-dropdown.query-handler';
import {
  FindPositionByRoleRequestDto,
  FindUserByBranchRequestDto,
} from './find-dropdown.request.dto';

@Controller(routesV1.version)
@ApiTags(
  `${resourcesV1.DROP_DOWN_DATA.parent} - ${resourcesV1.DROP_DOWN_DATA.displayName}`,
)
export class DropDownHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  // User
  @ApiOperation({ summary: 'Danh sách user' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: DropDownResponseDto,
  })
  @AuthPermission(resourcesV1.DROP_DOWN_DATA.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.dropdown.user.root)
  async getUserDropdown(
    @Query() queryDto: FindUserByBranchRequestDto,
  ): Promise<DropDownResponseDto> {
    return this.queryBus.execute(
      new FindDropdownQuery({
        type: DropDownTypeEnum.USER,
        branchCode: queryDto.branchCode,
        roleCode: queryDto.roleCode,
      }),
    );
  }

  // Role
  @ApiOperation({ summary: 'Danh sách role' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: DropDownResponseDto,
  })
  @AuthPermission(resourcesV1.DROP_DOWN_DATA.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.dropdown.role.root)
  async getRoleDropdown(): Promise<DropDownResponseDto> {
    return this.queryBus.execute(
      new FindDropdownQuery({
        type: DropDownTypeEnum.ROLE,
      }),
    );
  }

  // Position
  @ApiOperation({ summary: 'Danh sách vị trí' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: DropDownResponseDto,
  })
  @AuthPermission(resourcesV1.DROP_DOWN_DATA.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.dropdown.position.root)
  async getPositionDropdown(
    @Query() query: FindPositionByRoleRequestDto,
  ): Promise<DropDownResponseDto> {
    return this.queryBus.execute(
      new FindDropdownQuery({
        type: DropDownTypeEnum.POSITION,
        roleCode: query.roleCode,
      }),
    );
  }

  // Branch
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
      new FindDropdownQuery({
        type: DropDownTypeEnum.BRANCH,
      }),
    );
  }
}
