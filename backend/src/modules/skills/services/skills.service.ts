import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Skill, SkillDocument } from "../schemas/skills.schema";
import { Model } from "mongoose";
import { CreateSkillDto } from "../dtos/skill.dto";

@Injectable()
export class SkillsService {
    constructor(
        @InjectModel(Skill.name) private skillModel: Model<SkillDocument>,
    ) {}

    async getAll() {
        return this.skillModel.find().sort({ name: 1 }).exec();
    }

    async create(createSkillDto: CreateSkillDto) {
        const { name, aliases = [] } = createSkillDto;

        const existedSkill = await this.skillModel.findOne({ name });
        if (existedSkill) {
            throw new BadRequestException('Kỹ năng đã tồn tại');
        }

        const skill = await this.skillModel.create({ name, aliases });
        return { message: 'Tạo kỹ năng thành công', skill };
    }

    async remove(id: string) {
        const skill = await this.skillModel.findById(id).exec();
        if (!skill) {
            throw new NotFoundException('Không tìm thấy kỹ năng');
        }
        await this.skillModel.findByIdAndDelete(id).exec();
        return { message: 'Xóa kỹ năng thành công' };
    }

    async findOne(id: string) {
        const skill = await this.skillModel.findById(id).exec();
        if (!skill) {
            throw new NotFoundException('Không tìm thấy kỹ năng');
        }
        return skill;
    }
}