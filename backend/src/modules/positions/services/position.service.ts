import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Position, PositionDocument } from "../schemas/position.schema";
import { Model, Types } from "mongoose";
import { CreatePositionDto, UpdatePositionDto } from "../dtos/position.dto";
import { DepartmentService } from "src/modules/departments/services/department.service";

@Injectable()
export class PositionService {
    constructor(@InjectModel(Position.name) private positionModel: Model<PositionDocument>,
    private readonly departmentService: DepartmentService,
) {}

   async createPosition(
    createPositionDto: CreatePositionDto,
  ) {
    const { name, departmentId } = createPositionDto;

    await this.departmentService.findOne(departmentId);

    const existedPosition =
      await this.positionModel.findOne({
        name,
        departmentId,
      });

    if (existedPosition) {
      throw new BadRequestException(
        'Vị trí này đã tồn tại trong phòng ban',
      );
    }

    const position =
      await this.positionModel.create({
        name,
        departmentId,
        skillIds: [],
      });

    return {
      message: 'Tạo vị trí thành công',
      position,
    };
  }

  async getAllPositions() {
    return this.positionModel
      .find()
      .populate('departmentId', 'name code')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    const position =
      await this.positionModel
        .findById(id)
        .populate('departmentId', 'name code')
        .exec();

    if (!position) {
      throw new NotFoundException(
        'Không tìm thấy vị trí',
      );
    }

    return position;
  }

  async updatePosition(
    id: string,
    updatePositionDto: UpdatePositionDto,
  ) {
    const position =
      await this.positionModel
        .findById(id)
        .exec();

    if (!position) {
      throw new NotFoundException(
        'Không tìm thấy vị trí',
      );
    }

    const {
      name,
      departmentId,
    } = updatePositionDto;

    if (departmentId) {
      await this.departmentService.findOne(
        departmentId,
      );
    }

    const newName = name ?? position.name;

    const newDepartmentId =
      departmentId ?? position.departmentId;

    const existedPosition =
      await this.positionModel.findOne({
        name: newName,
        departmentId: newDepartmentId,
        _id: { $ne: id },
      });

    if (existedPosition) {
      throw new BadRequestException(
        'Vị trí này đã tồn tại trong phòng ban',
      );
    }

    Object.assign(
      position,
      updatePositionDto,
    );

    await position.save();

    return {
      message: 'Cập nhật vị trí thành công',
      position,
    };
  }

  async removePosition(id: string) {
    const position =
      await this.positionModel
        .findById(id)
        .exec();

    if (!position) {
      throw new NotFoundException(
        'Không tìm thấy vị trí',
      );
    }

    await this.positionModel
      .findByIdAndDelete(id)
      .exec();

    return {
      message: 'Xóa vị trí thành công',
    };
  }


    async addSkillToPositions(
    positionIds: string[],
    skillId: string,
    ) {
    await this.positionModel.updateMany(
        {
        _id: { $in: positionIds },
        },
        {
        $addToSet: {
            skillIds: skillId,
        },
        },
    );
    }

        async addSkill(
      positionId: string,
      skillId: string,
    ) {
      const position = await this.positionModel
        .findById(positionId)
        .exec();

      if (!position) {
        throw new NotFoundException(
          'Không tìm thấy vị trí',
        );
      }

      await this.positionModel.updateOne(
        { _id: positionId },
        {
          $addToSet: {
            skillIds: new Types.ObjectId(skillId),
          },
        },
      );

      return {
        message: 'Thêm kỹ năng vào vị trí thành công',
      };
    }

    async removeSkill(
      positionId: string,
      skillId: string,
    ) {
      const position = await this.positionModel
        .findById(positionId)
        .exec();

      if (!position) {
        throw new NotFoundException(
          'Không tìm thấy vị trí',
        );
      }

      await this.positionModel.updateOne(
        { _id: positionId },
        {
          $pull: {
            skillIds: new Types.ObjectId(skillId),
          },
        },
      );

      return {
        message: 'Xóa kỹ năng khỏi vị trí thành công',
      };
    }

    async getPositionsWithSkills() {
  return this.positionModel
    .find()
    .populate(
      'departmentId',
      'name code',
    )
    .populate(
      'skillIds',
      'name aliases',
    )
    .sort({ createdAt: -1 })
    .exec();
}
}