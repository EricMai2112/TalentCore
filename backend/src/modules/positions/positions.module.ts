import { Module } from '@nestjs/common';
import { PositionService } from './services/position.service';
import { PositionController } from './controllers/position.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Position, PositionSchema } from './schemas/position.schema';
import { DepartmentsModule } from '../departments/departments.module';

@Module({
    imports: [MongooseModule.forFeature([{name: Position.name, schema: PositionSchema}]),
    DepartmentsModule
],
    controllers: [PositionController],
    exports: [PositionService],
    providers: [PositionService]
})
export class PositionsModule {}
