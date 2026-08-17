import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Candidate, CandidateDocument } from '../schema/candidate.schema';
import { User, UserDocument } from 'src/modules/users/schemas/user.schema';
import { UpdateCandidateProfileDto } from '../dtos/candidate.dto';

@Injectable()
export class CandidateService {
  constructor(
    @InjectModel(Candidate.name) private candidateModel: Model<CandidateDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getProfileByUserId(userId: string) {
    let candidate = await this.candidateModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('userId', 'name email phone avatar')
      .exec();

    if (!candidate) {
      candidate = await this.candidateModel.create({
        userId: new Types.ObjectId(userId),
        skills: [],
        experiences: [],
        educations: [],
        projects: [],
        certifications: [],
        languages: [],
        customSections: [],
      });
      candidate = await candidate.populate('userId', 'name email phone avatar');
    }

    return candidate;
  }

  async updateProfile(userId: string, dto: UpdateCandidateProfileDto) {
    const { phone, ...candidateDto } = dto;
    if (phone !== undefined) {
    await this.userModel.findByIdAndUpdate(userId, {
      $set: { phone: phone.trim() },
      });
    } 
    const candidate = await this.candidateModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: dto },
      { returnDocument: 'after', upsert: true }
    ).populate('userId', 'name email phone avatar');

    return {
      message: 'Cập nhật hồ sơ thành công',
      data: candidate,
    };
  }
}