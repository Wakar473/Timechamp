import { IsEmail, IsString, MinLength, IsUUID, IsEnum, IsOptional, MaxLength, Matches } from 'class-validator';
import { UserRole } from '../../../common/enums';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    @MinLength(8)
    confirm_password: string;

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

    @IsOptional()
    @IsUUID()
    organization_id?: string;

    @IsOptional()
    @IsString()
    organization_name?: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}

export class ChangePasswordDto {
    @IsString()
    @MinLength(8)
    old_password: string;

    @IsString()
    @MinLength(8)
    new_password: string;

    @IsString()
    @MinLength(8)
    confirm_password: string;
}

export class ResetPasswordDto {
    @IsString()
    @MinLength(8)
    new_password: string;

    @IsString()
    @MinLength(8)
    confirm_password: string;
}
