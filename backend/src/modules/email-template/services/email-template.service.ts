import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import {
  EmailTemplate,
  EmailTemplateDocument,
} from '../schemas/email-template.schema';
import {
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
} from '../dtos/email-template.dto';

@Injectable()
export class EmailTemplateService {
  constructor(
    @InjectModel(EmailTemplate.name)
    private emailTemplateModel: Model<EmailTemplateDocument>,
  ) {}

  async create(
    createEmailTemplateDto: CreateEmailTemplateDto,
  ): Promise<EmailTemplateDocument> {
    const { name } = createEmailTemplateDto;

    const existing = await this.emailTemplateModel.findOne({ name }).exec();
    if (existing) {
      throw new BadRequestException(
        `Email template với tên "${name}" đã tồn tại`,
      );
    }

    const newTemplate = new this.emailTemplateModel(createEmailTemplateDto);
    return newTemplate.save();
  }

  async findAll(): Promise<EmailTemplateDocument[]> {
    return this.emailTemplateModel.find().exec();
  }

  async findById(id: string): Promise<EmailTemplateDocument> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Id "${id}" không hợp lệ`);
    }

    const template = await this.emailTemplateModel.findById(id).exec();
    if (!template) {
      throw new NotFoundException(
        `Email template với id "${id}" không tồn tại`,
      );
    }

    return template;
  }

  async update(
    id: string,
    updateEmailTemplateDto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplateDocument> {
    const template = await this.findById(id);

    const { name } = updateEmailTemplateDto;

    if (name && name !== template.name) {
      const duplicate = await this.emailTemplateModel
        .findOne({ name, _id: { $ne: id } })
        .exec();

      if (duplicate) {
        throw new BadRequestException(
          `Email template với tên "${name}" đã tồn tại`,
        );
      }
    }

    Object.assign(template, updateEmailTemplateDto);
    return template.save();
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.emailTemplateModel.findByIdAndDelete(id).exec();
  }
}
