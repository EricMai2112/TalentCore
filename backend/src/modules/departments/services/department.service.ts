import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Department, DepartmentDocument } from "../schemas/department.schema";
import { Model } from "mongoose";
import { CreateDepartMentDto, UpdateDepartmentDto } from "../dtos/department.dto";

@Injectable()
export class DepartmentService {
    constructor(@InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>) {}

    async createDepartment(createDepartMentDto: CreateDepartMentDto) {
        const {code, name, managerId} = createDepartMentDto

        const isExistedName = await this.departmentModel.findOne({name})

        if(isExistedName) {
            throw new BadRequestException("Phòng ban này đã tồn tại")
        }

        const isExistedCode = await this.departmentModel.findOne({code})

        if(isExistedCode) {
            throw new BadRequestException("Mã phòng ban này đã tồn tại")
        }

        const department = await this.departmentModel.create({
            name,
            code: code.toUpperCase(),
            managerId
        })

        return {
            message: "Tạo phòng ban thành công",
            department
        }
    }

    async getAllDepartments() {
        return this.departmentModel
                .find()
                .populate('managerId', "name email phone role")
                .sort({ createdAt: -1 })
                .exec();
    }

    async findOne(id: string) {
        const department = await this.departmentModel
        .findById(id)
        .populate(
            'managerId',
            'name email phone role',
        )
        .exec();

        if (!department) {
        throw new NotFoundException(
            'Không tìm thấy phòng ban',
        );
        }

        return department;
    }

    async update(
        id: string,
        updateDepartmentDto: UpdateDepartmentDto,
    ) {
        const department =
        await this.departmentModel.findById(id).exec();

        if (!department) {
        throw new NotFoundException(
            'Không tìm thấy phòng ban',
        );
        }

        if (updateDepartmentDto.code) {
        const code =
            updateDepartmentDto.code.toUpperCase();

        const existedCode =
            await this.departmentModel.findOne({
            code,
            _id: { $ne: id },
            });

        if (existedCode) {
            throw new BadRequestException(
            'Mã phòng ban đã tồn tại',
            );
        }

        updateDepartmentDto.code = code;
        }

        if (updateDepartmentDto.name) {
        const existedName =
            await this.departmentModel.findOne({
            name: updateDepartmentDto.name,
            _id: { $ne: id },
            });

        if (existedName) {
            throw new BadRequestException(
            'Tên phòng ban đã tồn tại',
            );
        }
        }

        Object.assign(
        department,
        updateDepartmentDto,
        );

        await department.save();

        return {
        message: 'Cập nhật phòng ban thành công',
        department,
        };
    }

    async remove(id: string) {
        const department =
        await this.departmentModel.findById(id).exec();

        if (!department) {
        throw new NotFoundException(
            'Không tìm thấy phòng ban',
        );
        }

        await this.departmentModel
        .findByIdAndDelete(id)
        .exec();

        return {
        message: 'Xóa phòng ban thành công',
        };
    }

}