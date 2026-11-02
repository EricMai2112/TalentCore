import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { PositionService } from '../services/position.service';
import {
  CreatePositionDto,
  UpdatePositionDto,
} from '../dtos/position.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';

@Controller('positions')
export class PositionController {
    constructor(
        private readonly positionService: PositionService,
    ) {}

    @Roles(UserRole.HR_ADMIN)
    @Post()
    async create(
        @Body() createPositionDto: CreatePositionDto,
    ) {
        return this.positionService.createPosition(
        createPositionDto,
        );
    }

    @Public()
    @Get()
    async findAll() {
        return this.positionService.getAllPositions();
    }

    @Public()
    @Get('with-skills')
    async getPositionsWithSkills() {
      return this.positionService.getPositionsWithSkills();
    }

    @Public()
    @Get(':id')
    async findOne(
        @Param('id') id: string,
    ) {
        return this.positionService.findOne(id);
    }

    @Roles(UserRole.HR_ADMIN)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updatePositionDto: UpdatePositionDto,
    ) {
        return this.positionService.updatePosition(
        id,
        updatePositionDto,
        );
    }

    @Roles(UserRole.HR_ADMIN)
    @Delete(':id')
    async remove(
        @Param('id') id: string,
    ) {
        return this.positionService.removePosition(id);
    }

    @Roles(UserRole.HR_ADMIN)
    @Post(':positionId/skills/:skillId')
    async addSkill(
      @Param('positionId') positionId: string,
      @Param('skillId') skillId: string,
    ) {
      return this.positionService.addSkill(
        positionId,
        skillId,
      );
    }

    @Roles(UserRole.HR_ADMIN)
    @Delete(':positionId/skills/:skillId')
    async removeSkill(
      @Param('positionId') positionId: string,
      @Param('skillId') skillId: string,
    ) {
      return this.positionService.removeSkill(
        positionId,
        skillId,
      );
    }
}