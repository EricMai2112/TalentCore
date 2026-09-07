import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Candidate, CandidateDocument } from '../schema/candidate.schema';
import { User, UserDocument } from 'src/modules/users/schemas/user.schema';
import {
  CreateCandidateProfileDto,
  UpdateCandidateProfileDto,
} from '../dtos/candidate.dto';

@Injectable()
export class CandidateService {
  constructor(
    @InjectModel(Candidate.name)
    private candidateModel: Model<CandidateDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}


  async listProfiles(userId: string) {
    const profiles = await this.candidateModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('userId', 'name email phone avatar')
      .sort({ isDefault: -1, createdAt: 1 })
      .exec();


    if (profiles.length === 0) {
      const created = await this.candidateModel.create({
        userId: new Types.ObjectId(userId),
        profileName: 'Hồ sơ của tôi',
        isDefault: true,
        skills: [],
        experiences: [],
        educations: [],
        projects: [],
        certifications: [],
        languages: [],
        customSections: [],
      });
      const populated = await created.populate(
        'userId',
        'name email phone avatar',
      );
      return [populated];
    }

    return profiles;
  }

  async getProfileById(userId: string, profileId: string) {
    const profile = await this.candidateModel
      .findOne({
        _id: new Types.ObjectId(profileId),
        userId: new Types.ObjectId(userId),
      })
      .populate('userId', 'name email phone avatar')
      .exec();

    if (!profile) {
      throw new NotFoundException('Không tìm thấy hồ sơ.');
    }
    return profile;
  }

  async getDefaultProfile(userId: string) {
    const profiles = await this.listProfiles(userId);
    const def = profiles.find((p) => p.isDefault) ?? profiles[0];
    return def;
  }

  async getProfileByUserId(userId: string) {
    return this.getDefaultProfile(userId);
  }

  async createProfile(userId: string, dto: CreateCandidateProfileDto) {
    const existingCount = await this.candidateModel.countDocuments({
      userId: new Types.ObjectId(userId),
    });

    if (existingCount >= 10) {
      throw new BadRequestException(
        'Bạn đã đạt giới hạn tối đa 10 hồ sơ. Vui lòng xóa bớt trước khi tạo mới.',
      );
    }

    const isFirstProfile = existingCount === 0;

    let cloneSource: CandidateDocument | null = null;
    if (dto.cloneFromCandidateId) {
      cloneSource = await this.candidateModel
        .findOne({
          _id: new Types.ObjectId(dto.cloneFromCandidateId),
          userId: new Types.ObjectId(userId),
        })
        .exec();
      if (!cloneSource) {
        throw new NotFoundException(
          'Hồ sơ gốc để sao chép không tồn tại.',
        );
      }
    }

    const newProfile = await this.candidateModel.create({
      userId: new Types.ObjectId(userId),
      profileName: dto.profileName,
      isDefault: isFirstProfile,
      headline: cloneSource?.headline ?? '',
      summary: cloneSource?.summary ?? '',
      careerObjective: cloneSource?.careerObjective ?? '',
      address: cloneSource?.address ?? '',
      cvPdfUrl: '',
      socialLinks: cloneSource?.socialLinks ?? [],
      skills: cloneSource?.skills ?? [],
      experiences: cloneSource?.experiences ?? [],
      educations: cloneSource?.educations ?? [],
      projects: cloneSource?.projects ?? [],
      certifications: cloneSource?.certifications ?? [],
      languages: cloneSource?.languages ?? [],
      customSections: cloneSource?.customSections ?? [],
    });

    const populated = await newProfile.populate(
      'userId',
      'name email phone avatar',
    );

    return {
      message: 'Tạo hồ sơ thành công',
      data: populated,
    };
  }

  async updateProfile(
    userId: string,
    profileId: string,
    dto: UpdateCandidateProfileDto,
  ) {

    const existing = await this.candidateModel.findOne({
      _id: new Types.ObjectId(profileId),
      userId: new Types.ObjectId(userId),
    });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy hồ sơ.');
    }

    const { name, phone, ...candidateDto } = dto;

    const userUpdates: Record<string, string> = {};
    if (name !== undefined && name !== null) userUpdates.name = name.trim();
    if (phone !== undefined && phone !== null) userUpdates.phone = phone.trim();
    if (Object.keys(userUpdates).length > 0) {
      await this.userModel.findByIdAndUpdate(userId, { $set: userUpdates });
    }

    const updated = await this.candidateModel
      .findByIdAndUpdate(
        profileId,
        { $set: candidateDto },
        { returnDocument: 'after' },
      )
      .populate('userId', 'name email phone avatar');

    return {
      message: 'Cập nhật hồ sơ thành công',
      data: updated,
    };
  }

  async setDefault(userId: string, profileId: string) {
    const profile = await this.candidateModel.findOne({
      _id: new Types.ObjectId(profileId),
      userId: new Types.ObjectId(userId),
    });
    if (!profile) {
      throw new NotFoundException('Không tìm thấy hồ sơ.');
    }

    await this.candidateModel.updateMany(
      { userId: new Types.ObjectId(userId) },
      { $set: { isDefault: false } },
    );
    await this.candidateModel.findByIdAndUpdate(profileId, {
      $set: { isDefault: true },
    });

    return { message: 'Đã đặt hồ sơ mặc định thành công.' };
  }

  async deleteProfile(userId: string, profileId: string) {
    const profile = await this.candidateModel.findOne({
      _id: new Types.ObjectId(profileId),
      userId: new Types.ObjectId(userId),
    });
    if (!profile) {
      throw new NotFoundException('Không tìm thấy hồ sơ.');
    }

    const totalCount = await this.candidateModel.countDocuments({
      userId: new Types.ObjectId(userId),
    });
    if (totalCount <= 1) {
      throw new BadRequestException(
        'Bạn phải giữ ít nhất một hồ sơ.',
      );
    }

    await this.candidateModel.findByIdAndDelete(profileId);

    if (profile.isDefault) {
      const remaining = await this.candidateModel
        .findOne({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 });
      if (remaining) {
        await this.candidateModel.findByIdAndUpdate(remaining._id, {
          $set: { isDefault: true },
        });
      }
    }

    return { message: 'Đã xóa hồ sơ thành công.' };
  }
}
