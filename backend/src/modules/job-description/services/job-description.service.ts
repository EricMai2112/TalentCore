import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { JobDescription, JobDescriptionDocument, JobStatus } from '../schemas/job-description.schema';
import { CreateJobDescriptionDto, UpdateJobDescriptionDto } from '../dtos/job-description.dto';
import { EventsGateway } from '../gateways/events.gateway';

@Injectable()
export class JobDescriptionService {
  constructor(
    @InjectModel(JobDescription.name)
    private readonly jobDescriptionModel: Model<JobDescriptionDocument>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async create(createDto: CreateJobDescriptionDto): Promise<JobDescriptionDocument> {
    const newJob = new this.jobDescriptionModel(createDto);
    const saved = await newJob.save();
    const populated = await this.findById(saved._id.toString());
    if (populated.status === JobStatus.JD_CREATED) {
      this.eventsGateway.emitJobPublished(populated);
    }
    return populated;
  }

  async findAll(): Promise<JobDescriptionDocument[]> {
    return this.jobDescriptionModel
      .find()
      .populate('departmentId')
      .populate('pipelineTemplateId')
      .populate('requiredSkills')
      .populate('interviewerId')
      .populate('postedById')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPublicJobs(): Promise<JobDescriptionDocument[]> {
    return this.jobDescriptionModel
      .find({ status: JobStatus.JD_CREATED })
      .populate('departmentId')
      .populate('pipelineTemplateId')
      .populate('requiredSkills')
      .populate('interviewerId')
      .populate('postedById')
      .sort({ updatedAt: -1 })
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

    if (updatedJob.status === JobStatus.JD_CREATED) {
      this.eventsGateway.emitJobPublished(updatedJob);
    } else {
      this.eventsGateway.emitJobUpdated(updatedJob);
    }

    return updatedJob;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.jobDescriptionModel.findByIdAndDelete(id).exec();
  }
}
