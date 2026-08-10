import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import {
  PipelineTemplate,
  PipelineTemplateDocument,
  Stage,
} from '../schemas/pipeline-template.schema';
import {
  CreatePipelineTemplateDto,
  UpdatePipelineTemplateDto,
} from '../dtos/pipeline-template.dto';

@Injectable()
export class PipelineTemplateService {
  constructor(
    @InjectModel(PipelineTemplate.name)
    private pipelineTemplateModel: Model<PipelineTemplateDocument>,
  ) {}

  async create(
    createPipelineTemplateDto: CreatePipelineTemplateDto,
  ): Promise<PipelineTemplateDocument> {
    const { name, stages } = createPipelineTemplateDto;

    const existingTemplate = await this.pipelineTemplateModel
      .findOne({ name })
      .exec();

    if (existingTemplate) {
      throw new BadRequestException(
        `Pipeline template với tên "${name}" đã tồn tại`,
      );
    }

    const orders = stages.map((s) => s.order);
    const uniqueOrders = new Set(orders);
    if (uniqueOrders.size !== orders.length) {
      throw new BadRequestException(
        'Các stage không được có cùng giá trị order',
      );
    }

    const sortedStages = [...stages].sort((a, b) => a.order - b.order);

    const newTemplate = new this.pipelineTemplateModel({
      name,
      stages: sortedStages,
    });

    return newTemplate.save();
  }

  async findAll(): Promise<PipelineTemplateDocument[]> {
    return this.pipelineTemplateModel.find().exec();
  }

  async findById(id: string): Promise<PipelineTemplateDocument> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Id "${id}" không hợp lệ`);
    }
    const template = await this.pipelineTemplateModel.findById(id).exec();
    if (!template) {
      throw new NotFoundException(
        `Pipeline template với id "${id}" không tồn tại`,
      );
    }
    return template;
  }

  async update(
    id: string,
    updatePipelineTemplateDto: UpdatePipelineTemplateDto,
  ): Promise<PipelineTemplateDocument> {
    const template = await this.findById(id);

    const { name, stages } = updatePipelineTemplateDto;

    // Kiểm tra tên trùng với template khác
    if (name && name !== template.name) {
      const duplicateName = await this.pipelineTemplateModel
        .findOne({ name, _id: { $ne: id } })
        .exec();

      if (duplicateName) {
        throw new BadRequestException(
          `Pipeline template với tên "${name}" đã tồn tại`,
        );
      }

      template.name = name;
    }

    // Cập nhật stages nếu có
    if (stages) {
      const orders = stages.map((s) => s.order);
      const uniqueOrders = new Set(orders);
      if (uniqueOrders.size !== orders.length) {
        throw new BadRequestException(
          'Các stage không được có cùng giá trị order',
        );
      }

      const sortedStages = [...stages].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      );
      template.stages = sortedStages as Stage[];
    }

    return template.save();
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.pipelineTemplateModel.findByIdAndDelete(id).exec();
  }
}
