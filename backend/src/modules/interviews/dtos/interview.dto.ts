import { IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { LocationType, InterviewStatus, InterviewResult } from '../schemas/interview.schema';

export class CreateInterviewDto {
  @IsNotEmpty()
  @IsString()
  applicationId: string;

  @IsNotEmpty()
  @IsString()
  interviewerId: string;

  @IsNotEmpty()
  @IsString()
  date: string; // ISO date string e.g. "2026-07-28"

  @IsNotEmpty()
  @IsString()
  startTime: string; // e.g. "14:00"

  @IsNotEmpty()
  @IsString()
  endTime: string; // e.g. "15:30"

  @IsEnum(LocationType)
  @IsOptional()
  locationType?: LocationType;

  @IsBoolean()
  @IsOptional()
  autoCreateMeet?: boolean;

  @IsString()
  @IsOptional()
  meetingLink?: string;

  @IsString()
  @IsOptional()
  offsiteLocation?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateInterviewDto {
  @IsOptional()
  @IsString()
  interviewerId?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsEnum(LocationType)
  @IsOptional()
  locationType?: LocationType;

  @IsBoolean()
  @IsOptional()
  autoCreateMeet?: boolean;

  @IsString()
  @IsOptional()
  meetingLink?: string;

  @IsString()
  @IsOptional()
  offsiteLocation?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(InterviewStatus)
  @IsOptional()
  status?: InterviewStatus;

  @IsEnum(InterviewResult)
  @IsOptional()
  result?: InterviewResult;

  @IsString()
  @IsOptional()
  feedback?: string;
}

export class RequestDeptScheduleDto {
  @IsNotEmpty()
  @IsString()
  applicationId: string;
}

export class SubmitDeptScheduleDto {
  @IsNotEmpty()
  @IsString()
  date: string;

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;

  @IsEnum(LocationType)
  @IsOptional()
  locationType?: LocationType;

  @IsString()
  @IsOptional()
  meetingLink?: string;

  @IsString()
  @IsOptional()
  offsiteLocation?: string;

  @IsNotEmpty()
  @IsString()
  interviewerId: string;

  @IsOptional()
  interviewerIds?: string[];

  @IsString()
  @IsOptional()
  notes?: string;
}

export class TimeSlotDto {
  @IsNotEmpty()
  @IsString()
  date: string;

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;
}

export class CandidateRescheduleDto {
  @IsOptional()
  selectedSlot?: TimeSlotDto;

  @IsOptional()
  customSlot?: TimeSlotDto;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class ProposeAdminSlotsDto {
  @IsNotEmpty()
  proposedSlots: TimeSlotDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CandidateCancelDto {
  @IsNotEmpty()
  @IsString()
  reason: string;
}

export class UpdateInterviewStatusDto {
  @IsEnum(InterviewStatus)
  @IsOptional()
  status?: InterviewStatus;

  @IsEnum(InterviewResult)
  @IsOptional()
  result?: InterviewResult;

  @IsString()
  @IsOptional()
  feedback?: string;
}
