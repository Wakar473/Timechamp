import { IsEmail, IsNotEmpty, IsString, IsEnum, IsUUID, IsOptional, MinLength, MaxLength } from 'class-validator';
import { UserRole } from '../../../common/enums';

export class InviteUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(2)
    @MaxLength(100)
    first_name: string;

    @IsString()
    @MinLength(2)
    @MaxLength(100)
    last_name: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    employee_id: string;

    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;

    @IsUUID()
    @IsOptional()
    manager_id?: string;
}

export class UpdateUserRoleDto {
    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;
}

export class UpdateUserStatusDto {
    @IsString()
    @IsNotEmpty()
    status: string;
}

export class AssignManagerDto {
    @IsUUID()
    @IsNotEmpty()
    manager_id: string;
}
