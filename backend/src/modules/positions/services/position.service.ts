import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Position, PositionDocument } from "../schemas/position.schema";
import { Model } from "mongoose";

@Injectable()
export class PositionService {
    constructor(@InjectModel(Position.name) private positionModel: Model<PositionDocument>) {}

    async addSkillToPositions(
    positionIds: string[],
    skillId: string,
    ) {
    await this.positionModel.updateMany(
        {
        _id: { $in: positionIds },
        },
        {
        $addToSet: {
            skillIds: skillId,
        },
        },
    );
    }
}