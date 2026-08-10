import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

export type UserDocument = User & Document

export enum UserRole {
  CANDIDATE = "Ứng viên",
  HR_ADMIN = "Quản trị nhân sự",
  EMPLOYEE = "Nhân viên",
  DEPARTMENT_MANAGER = "Quản lý phòng ban",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  LOCKED = "LOCKED",
}

@Schema({timestamps: true})
export class User {
    @Prop({required: true})
    name: string

    @Prop({required: true, unique: true})
    email: string

    @Prop({required: true})
    phone: string

    @Prop({required: true, enum: UserRole, default: UserRole.CANDIDATE})
    role: UserRole

    @Prop({required: true, enum: UserStatus, default: UserStatus.ACTIVE})
    status: UserStatus

    @Prop({required: true})
    password: string

    createdAt: Date

    updatedAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User);