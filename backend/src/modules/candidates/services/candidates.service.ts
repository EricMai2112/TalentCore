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
    const { name, phone, ...candidateDto } = dto;

    const userUpdates: Record<string, string> = {};
    if (name !== undefined && name !== null) {
      userUpdates.name = name.trim();
    }
    if (phone !== undefined && phone !== null) {
      userUpdates.phone = phone.trim();
    }
    if (Object.keys(userUpdates).length > 0) {
      await this.userModel.findByIdAndUpdate(userId, {
        $set: userUpdates,
      });
    }

    const candidate = await this.candidateModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        { $set: candidateDto },
        { returnDocument: 'after', upsert: true },
      )
      .populate('userId', 'name email phone avatar');

    return {
      message: 'Cập nhật hồ sơ thành công',
      data: candidate,
    };
  }
}