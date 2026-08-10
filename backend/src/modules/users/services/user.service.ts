import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument, UserStatus } from "../schemas/user.schema";
import { Model } from "mongoose";
import { CreateEmployeeDto } from "../dtos/user.dto";
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
        const {email, name, phone, role, departmentId} = createEmployeeDto

        const isExistedEmail = await this.userModel.findOne({email}).exec()

        if(isExistedEmail) {
            throw new BadRequestException("Email đã tồn tại trong hệ thống")
        }

        const defaultPassword = "111111"

        const hashedPassword = await bcrypt.hash(defaultPassword, 10)

        const newUser = new this.userModel({
            email,
            name,
            phone,
            role,
            departmentId,
            password: hashedPassword,
            status: UserStatus.ACTIVE
        })

        await newUser.save()

        return {
            message: "Tạo tài khoản nhân viên thành công",
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                phone: newUser.phone,
                role: newUser.role,
                departmentId: newUser.departmentId
            }
        }
    }
}