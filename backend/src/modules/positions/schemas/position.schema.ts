import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

export type PositionDocument = Position & Document;

@Schema({ timestamps: true })
export class Position {
  @Prop({
    type: Types.ObjectId,
    ref: 'Department',
    required: true,
  })
  departmentId: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    type: [Types.ObjectId],
    ref: 'Skill',
    default: [],
  })
  skillIds: Types.ObjectId[];
}

export const PositionSchema =
  SchemaFactory.createForClass(Position);