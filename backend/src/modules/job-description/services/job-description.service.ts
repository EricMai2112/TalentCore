import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { JobDescription, JobDescriptionDocument } from '../schemas/job-description.schema';
import { CreateJobDescriptionDto, UpdateJobDescriptionDto } from '../dtos/job-description.dto';

@Injectable()
export class JobDescriptionService {
  constructor(
    @InjectModel(JobDescription.name)
    private readonly jobDescriptionModel: Model<JobDescriptionDocument>,
  ) {}

  async create(createDto: CreateJobDescriptionDto): Promise<JobDescriptionDocument> {
    const newJob = new this.jobDescriptionModel(createDto);
    return newJob.save();
  }

  async findAll(): Promise<JobDescriptionDocument[]> {
    return this.jobDescriptionModel
      .find()
      .populate('departmentId')
      .populate('pipelineTemplateId')
      .populate('requiredSkills')
      .populate('interviewerId')
      .populate('postedById')
      .exec();
  }

  async findById(id: string): Promise<JobDescriptionDocument> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Id "${id}" không hợp lệ`);
    }
    const job = await this.jobDescriptionModel
      .findById(id)
      .populate('departmentId')
      .populate('pipelineTemplateId')
      .populate('requiredSkills')
      .populate('interviewerId')
      .populate('postedById')
      .exec();
    if (!job) {
      throw new NotFoundException(`Không tìm thấy Job Description với id "${id}"`);
    }
    return job;
  }

  async update(id: string, updateDto: UpdateJobDescriptionDto): Promise<JobDescriptionDocument> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Id "${id}" không hợp lệ`);
    }

    const updatedJob = await this.jobDescriptionModel
      .findByIdAndUpdate(id, { $set: updateDto }, { new: true, runValidators: true })
      .populate('departmentId')
      .populate('pipelineTemplateId')
      .populate('requiredSkills')
      .populate('interviewerId')
      .populate('postedById')
      .exec();

    if (!updatedJob) {
      throw new NotFoundException(`Không tìm thấy Job Description với id "${id}"`);
    }
    return updatedJob;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.jobDescriptionModel.findByIdAndDelete(id).exec();
  }
}
