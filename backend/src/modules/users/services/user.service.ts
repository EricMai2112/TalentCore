import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument, UserRole, UserStatus } from "../schemas/user.schema";
import { Model } from "mongoose";
import { CreateEmployeeDto, UpdateEmployeeDto, ToggleStatusDto } from "../dtos/user.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async findByEmail(email: string) {
        return this.userModel.findOne({ email }).exec();
    }

    async createUser(data: Partial<User>) {
        const user = new this.userModel(data);
        return user.save();
    }

    async createEmployee(createEmployeeDto: CreateEmployeeDto) {
        const { email, name, phone, role, departmentId } = createEmployeeDto;

        const isExistedEmail = await this.userModel.findOne({ email }).exec();
        if (isExistedEmail) {
            throw new BadRequestException("Email đã tồn tại trong hệ thống");
        }

        const defaultPassword = "111111";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const newUser = new this.userModel({
            email,
            name,
            phone,
            role,
            departmentId,
            password: hashedPassword,
            status: UserStatus.ACTIVE,
        });

        await newUser.save();

        return {
            message: "Tạo tài khoản nhân viên thành công",
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                phone: newUser.phone,
                role: newUser.role,
                departmentId: newUser.departmentId,
            },
        };
    }

    async updateEmployee(id: string, updateEmployeeDto: UpdateEmployeeDto) {
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new NotFoundException("Không tìm thấy người dùng");
        }

        Object.assign(user, updateEmployeeDto);
        await user.save();

        const { password: _, ...result } = user.toObject();
        return {
            message: "Cập nhật thông tin nhân viên thành công",
            user: result,
        };
    }

    async toggleStatus(id: string, toggleStatusDto: ToggleStatusDto) {
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new NotFoundException("Không tìm thấy người dùng");
        }

        user.status = toggleStatusDto.status;
        await user.save();

        return {
            message: user.status === UserStatus.ACTIVE
                ? "Tài khoản đã được kích hoạt"
                : "Tài khoản đã bị khóa",
            user: {
                id: user.id,
                status: user.status,
            },
        };
    }

    async getEmployees() {
        return this.userModel
            .find({ role: { $ne: UserRole.CANDIDATE } }, { password: 0 })
            .exec();
    }
}