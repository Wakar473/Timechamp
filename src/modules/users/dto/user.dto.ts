import { IsEmail, IsNotEmpty, IsString, IsEnum, IsUUID, IsOptional } from 'class-validator';
import { UserRole } from '../../../common/enums';

export class InviteUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    name: string;

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
