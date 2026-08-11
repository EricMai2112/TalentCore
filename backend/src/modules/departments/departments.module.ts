import { Module } from '@nestjs/common';
import { DepartmentService } from './services/department.service';
import { DepartmentController } from './controllers/department.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Department, DepartmentSchema } from './schemas/department.schema';

@Module({
    imports: [MongooseModule.forFeature([{name: Department.name, schema: DepartmentSchema}])],
    controllers: [DepartmentController],
    providers: [DepartmentService],
    exports: [DepartmentService]
})
export class DepartmentsModule {}
