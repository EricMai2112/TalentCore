import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Skill, SkillDocument } from "../schemas/skills.schema";
import { Model } from "mongoose";
import { PositionService } from "src/modules/positions/services/position.service";
import { CreateSkillDto } from "../dtos/skill.dto";

@Injectable()
export class SkillsService {
    constructor(@InjectModel(Skill.name) private skillModel: Model<SkillDocument>,
    private readonly positionService: PositionService
) {}

    async create(createSkillDto: CreateSkillDto) {
    const {
      name,
      aliases = [],
      positionIds = [],
    } = createSkillDto;

    const existedSkill = await this.skillModel.findOne({
      name,
    });

    if (existedSkill) {
      throw new BadRequestException(
        'Kỹ năng đã tồn tại',
      );
    }

    const skill = await this.skillModel.create({
      name,
      aliases,
    });

    if (positionIds.length > 0) {
      await this.positionService.addSkillToPositions(
        positionIds,
        skill._id.toString(),
      );
    }

    return skill;
  }

  async remove(id: string) {
  const skill = await this.skillModel.findById(id).exec();

  if (!skill) {
    throw new NotFoundException('Không tìm thấy kỹ năng');
  }

  await this.skillModel.findByIdAndDelete(id).exec();

  return {
    message: 'Xóa kỹ năng thành công',
  };
}
}