import { IsNotEmpty, IsString, IsOptional, IsUUID, IsArray } from 'class-validator';

export class CreateProjectDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdateProjectDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;
}

export class AssignProjectDto {
    @IsArray()
    @IsUUID('4', { each: true })
    user_ids: string[];
}
