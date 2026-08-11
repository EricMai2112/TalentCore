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

@Controller('positions')
export class PositionController {
    constructor(
        private readonly positionService: PositionService,
    ) {}

    @Post()
    async create(
        @Body() createPositionDto: CreatePositionDto,
    ) {
        return this.positionService.createPosition(
        createPositionDto,
        );
    }

    @Get()
    async findAll() {
        return this.positionService.getAllPositions();
    }

    @Get('with-skills')
  async getPositionsWithSkills() {
    return this.positionService.getPositionsWithSkills();
  }

    @Get(':id')
    async findOne(
        @Param('id') id: string,
    ) {
        return this.positionService.findOne(id);
    }

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

    @Delete(':id')
    async remove(
        @Param('id') id: string,
    ) {
        return this.positionService.removePosition(id);
    }

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