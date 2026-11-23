import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  CANDIDATE = 'CANDIDATE',
  HR_ADMIN = 'HR_ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  DEPARTMENT_MANAGER = 'DEPARTMENT_MANAGER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
}

@Schema({ timestamps: true })
export class User {

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false, default: '' })
  name?: string;

  @Prop({ required: false, default: '' })
  phone?: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.CANDIDATE })
  role: UserRole;

  @Prop({ required: true, enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId?: Types.ObjectId;

  @Prop({ required: false })
  forgot_password_token?: string;

  @Prop({ required: false })
  forgot_password_otp?: string;

  @Prop({ required: false, type: Date })
  forgot_password_otp_expires_at?: Date | null;

  @Prop({ required: false, default: 0 })
  forgot_password_otp_attempts?: number;

  @Prop({ required: false, type: Date })
  forgot_password_requested_at?: Date | null;

  @Prop({ required: false, default: 0 })
  forgot_password_request_count?: number;

  @Prop({ required: false, type: Date })
  forgot_password_request_window_start?: Date;

  createdAt: Date;

  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
