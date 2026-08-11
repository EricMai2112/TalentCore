import { IsEmpty, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateDepartMentDto {

    @IsNotEmpty({message: "Tên phòng ban không được để trống"})
    @IsString()
    name: string

    @IsNotEmpty({message: "Mã phòng ban không được để trống"})
    @IsString()
    code: string

     @IsOptional()
    @IsMongoId({
        message: 'Manager không hợp lệ',
    })
    managerId?: string;
}

export class UpdateDepartmentDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty({
        message: 'Tên phòng ban không được để trống',
    })
    name?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty({
        message: 'Mã phòng ban không được để trống',
    })
    code?: string;

    @IsOptional()
    @IsMongoId({
        message: 'Manager không hợp lệ',
    })
    managerId?: string;
}