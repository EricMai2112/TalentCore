import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Department, DepartmentDocument } from "../schemas/department.schema";
import { User, UserDocument, UserRole } from "../../users/schemas/user.schema";
import { Model, Types } from "mongoose";
import { CreateDepartMentDto, UpdateDepartmentDto } from "../dtos/department.dto";

@Injectable()
export class DepartmentService {
    constructor(
        @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}

    private async syncManagerDepartment(
        deptId: string,
        newManagerId: string | null | undefined,
        oldManagerId: string | null | undefined,
    ) {
        const deptObjectId = new Types.ObjectId(deptId);

        if (oldManagerId && String(oldManagerId) !== String(newManagerId)) {
            const oldManagerObjectId = new Types.ObjectId(oldManagerId);

            const otherDeptManaged = await this.departmentModel.findOne({
                managerId: oldManagerObjectId,
                _id: { $ne: deptObjectId },
            });

            if (!otherDeptManaged) {
                await this.userModel.findByIdAndUpdate(oldManagerObjectId, {
                    $unset: { departmentId: "" },
                    $set: { role: UserRole.EMPLOYEE },
                });
            }
        }

        if (newManagerId) {
            const newManagerObjectId = new Types.ObjectId(newManagerId);

            await this.userModel.findByIdAndUpdate(newManagerObjectId, {
                $set: {
                    departmentId: deptObjectId,
                    role: UserRole.DEPARTMENT_MANAGER,
                },
            });
        }
    }


    async createDepartment(createDepartMentDto: CreateDepartMentDto) {
        const { code, name, managerId } = createDepartMentDto;

        const isExistedName = await this.departmentModel.findOne({ name });
        if (isExistedName) {
            throw new BadRequestException("Phòng ban này đã tồn tại");
        }

        const isExistedCode = await this.departmentModel.findOne({ code });
        if (isExistedCode) {
            throw new BadRequestException("Mã phòng ban này đã tồn tại");
        }

        const department = await this.departmentModel.create({
            name,
            code: code.toUpperCase(),
            managerId: managerId ? new Types.ObjectId(managerId) : undefined,
        });

        if (managerId) {
            await this.syncManagerDepartment(
                String(department._id),
                managerId,
                null,
            );
        }

        return {
            message: "Tạo phòng ban thành công",
            department,
        };
    }

    async getAllDepartments() {
        return this.departmentModel
            .find()
            .populate("managerId", "name email phone role")
            .sort({ createdAt: -1 })
            .exec();
    }

    async findOne(id: string) {
        const department = await this.departmentModel
            .findById(id)
            .populate("managerId", "name email phone role")
            .exec();

        if (!department) {
            throw new NotFoundException("Không tìm thấy phòng ban");
        }

        return department;
    }

    async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
        const department = await this.departmentModel.findById(id).exec();

        if (!department) {
            throw new NotFoundException("Không tìm thấy phòng ban");
        }

        if (updateDepartmentDto.code) {
            const code = updateDepartmentDto.code.toUpperCase();
            const existedCode = await this.departmentModel.findOne({
                code,
                _id: { $ne: id },
            });
            if (existedCode) {
                throw new BadRequestException("Mã phòng ban đã tồn tại");
            }
            updateDepartmentDto.code = code;
        }

        if (updateDepartmentDto.name) {
            const existedName = await this.departmentModel.findOne({
                name: updateDepartmentDto.name,
                _id: { $ne: id },
            });
            if (existedName) {
                throw new BadRequestException("Tên phòng ban đã tồn tại");
            }
        }

        const oldManagerId = department.managerId
            ? String(department.managerId)
            : null;

        // Áp dụng thay đổi
        Object.assign(department, updateDepartmentDto);
        if (updateDepartmentDto.managerId) {
            department.managerId = new Types.ObjectId(updateDepartmentDto.managerId) as any;
        }
        await department.save();

        if ("managerId" in updateDepartmentDto) {
            const newManagerId = updateDepartmentDto.managerId ?? null;
            await this.syncManagerDepartment(id, newManagerId, oldManagerId);
        }

        return {
            message: "Cập nhật phòng ban thành công",
            department,
        };
    }

    async remove(id: string) {
        const deptObjectId = new Types.ObjectId(id);
        const department = await this.departmentModel.findById(deptObjectId).exec();

        if (!department) {
            throw new NotFoundException("Không tìm thấy phòng ban");
        }

        if (department.managerId) {
            const managerObjectId = new Types.ObjectId(department.managerId);
            const otherDeptManaged = await this.departmentModel.findOne({
                managerId: managerObjectId,
                _id: { $ne: deptObjectId },
            });

            if (!otherDeptManaged) {
                await this.userModel.findByIdAndUpdate(managerObjectId, {
                    $unset: { departmentId: "" },
                    $set: { role: UserRole.EMPLOYEE },
                });
            }
        }

        await this.userModel.updateMany(
            { departmentId: deptObjectId },
            { $unset: { departmentId: "" } },
        );

        await this.departmentModel.findByIdAndDelete(deptObjectId).exec();

        return {
            message: "Xóa phòng ban thành công",
        };
    }
}