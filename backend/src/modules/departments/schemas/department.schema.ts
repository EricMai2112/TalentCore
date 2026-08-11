import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Types } from "mongoose"

export type DepartmentDocument = Department & Document

@Schema({timestamps: true})
export class Department {

    @Prop({
        type: Types.ObjectId,
        ref: "User",
        required: false
    })
    managerId?: Types.ObjectId;

    @Prop({required: true, unique: true})
    name: string

    @Prop({
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    })
    code: string;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department)