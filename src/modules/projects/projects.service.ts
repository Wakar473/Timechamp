import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private projectRepository: Repository<Project>,
    ) { }

    async create(
        createProjectDto: CreateProjectDto,
        userId: string,
        organizationId: string,
    ): Promise<Project> {
        const project = this.projectRepository.create({
            ...createProjectDto,
            created_by: userId,
            organization_id: organizationId,
        });

        return this.projectRepository.save(project);
    }

    async findAll(organizationId: string): Promise<Project[]> {
        return this.projectRepository.find({
            where: { organization_id: organizationId },
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: string, organizationId: string): Promise<Project> {
        const project = await this.projectRepository.findOne({
            where: { id, organization_id: organizationId },
        });

        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }

        return project;
    }

    async update(
        id: string,
        updateProjectDto: UpdateProjectDto,
        organizationId: string,
    ): Promise<Project> {
        const project = await this.findOne(id, organizationId);

        Object.assign(project, updateProjectDto);

        return this.projectRepository.save(project);
    }

    async remove(id: string, organizationId: string): Promise<void> {
        const project = await this.findOne(id, organizationId);
        await this.projectRepository.remove(project);
    }
}
