import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose"
import { Document, Types } from "mongoose"

export type UserDocument = User & Document

export enum UserRole {
  CANDIDATE = 'CANDIDATE',
  HR_ADMIN = 'HR_ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  DEPARTMENT_MANAGER = 'DEPARTMENT_MANAGER',
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
    
    @Prop()
    departmentId?: Types.ObjectId;

    createdAt: Date

    updatedAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User);