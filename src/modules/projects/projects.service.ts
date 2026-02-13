import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project, ProjectAssignment, User, ProjectType, UserRole } from '../../entities';
import { CreateProjectDto, UpdateProjectDto, AssignProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private projectRepository: Repository<Project>,
        @InjectRepository(ProjectAssignment)
        private projectAssignmentRepository: Repository<ProjectAssignment>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    /**
     * Create a new project
     */
    async create(
        createProjectDto: CreateProjectDto,
        createdBy: User,
    ): Promise<Project> {
        // Only admins and managers can create projects
        if (createdBy.role === UserRole.EMPLOYEE) {
            throw new ForbiddenException('Employees cannot create projects');
        }

        const project = this.projectRepository.create({
            ...createProjectDto,
            created_by: createdBy.id,
            organization_id: createdBy.organization_id,
            project_type: ProjectType.NORMAL,
            is_active: true,
        });

        return await this.projectRepository.save(project);
    }

    /**
     * Create system project for a new organization
     */
    async createSystemProject(organizationId: string, createdBy: string): Promise<Project> {
        const project = this.projectRepository.create({
            name: 'Internal / Training',
            description: 'Default project for onboarding and internal tasks',
            organization_id: organizationId,
            created_by: createdBy,
            project_type: ProjectType.SYSTEM,
            is_active: true,
        });

        return await this.projectRepository.save(project);
    }

    /**
     * Get projects with role-based filtering
     */
    async findAll(user: User): Promise<Project[]> {
        const { id: userId, role, organization_id } = user;

        if (role === UserRole.ADMIN) {
            // Admins see all projects in organization
            return await this.projectRepository.find({
                where: {
                    organization_id,
                    is_active: true,
                },
                order: { created_at: 'DESC' },
            });
        } else if (role === UserRole.MANAGER) {
            // Managers see only their own created projects
            return await this.projectRepository.find({
                where: {
                    organization_id,
                    created_by: userId,
                    is_active: true,
                },
                order: { created_at: 'DESC' },
            });
        } else {
            // Employees see only assigned projects
            const assignments = await this.projectAssignmentRepository.find({
                where: { user_id: userId },
                relations: ['project'],
            });

            return assignments
                .map(assignment => assignment.project)
                .filter(project => project && project.is_active)
                .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
        }
    }

    /**
     * Get system project for organization
     */
    async getSystemProject(organizationId: string): Promise<Project> {
        const systemProject = await this.projectRepository.findOne({
            where: {
                organization_id: organizationId,
                project_type: ProjectType.SYSTEM,
                is_active: true,
            },
        });

        if (!systemProject) {
            throw new NotFoundException('System project not found for organization');
        }

        return systemProject;
    }

    /**
     * Find one project with access validation
     */
    async findOne(projectId: string, user: User): Promise<Project> {
        const project = await this.projectRepository.findOne({
            where: { id: projectId },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // Validate organization boundary
        if (project.organization_id !== user.organization_id) {
            throw new ForbiddenException('Cannot access projects from other organizations');
        }

        // Validate access based on role
        await this.validateProjectAccess(projectId, user);

        return project;
    }

    /**
     * Update project
     */
    async update(
        projectId: string,
        updateProjectDto: UpdateProjectDto,
        user: User,
    ): Promise<Project> {
        const project = await this.projectRepository.findOne({
            where: { id: projectId },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // Validate organization boundary
        if (project.organization_id !== user.organization_id) {
            throw new ForbiddenException('Cannot access projects from other organizations');
        }

        // Only admin or project creator can update
        if (user.role !== UserRole.ADMIN && project.created_by !== user.id) {
            throw new ForbiddenException('Only project creator or admin can update this project');
        }

        // Prevent updating system projects
        if (project.project_type === ProjectType.SYSTEM) {
            throw new ForbiddenException('Cannot modify system projects');
        }

        Object.assign(project, updateProjectDto);
        return await this.projectRepository.save(project);
    }

    /**
     * Archive project (soft delete)
     */
    async archive(projectId: string, user: User): Promise<void> {
        const project = await this.projectRepository.findOne({
            where: { id: projectId },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // Validate organization boundary
        if (project.organization_id !== user.organization_id) {
            throw new ForbiddenException('Cannot access projects from other organizations');
        }

        // Only admin can archive projects
        if (user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Only admins can archive projects');
        }

        // Prevent archiving system projects
        if (project.project_type === ProjectType.SYSTEM) {
            throw new ForbiddenException('Cannot archive system project');
        }

        project.is_active = false;
        project.archived_at = new Date();
        await this.projectRepository.save(project);
    }

    /**
     * Assign users to project
     */
    async assignUsersToProject(
        projectId: string,
        assignDto: AssignProjectDto,
        assignedBy: User,
    ): Promise<void> {
        const project = await this.projectRepository.findOne({
            where: { id: projectId },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // Validate organization boundary
        if (project.organization_id !== assignedBy.organization_id) {
            throw new ForbiddenException('Cannot access projects from other organizations');
        }

        // Only admin or project creator can assign users
        if (assignedBy.role !== UserRole.ADMIN && project.created_by !== assignedBy.id) {
            throw new ForbiddenException('Only project creator or admin can assign users');
        }

        // Verify all users exist and validate team boundaries
        const users = await this.userRepository.find({
            where: { id: In(assignDto.user_ids) },
            select: ['id', 'organization_id', 'manager_id'],
        });

        if (users.length !== assignDto.user_ids.length) {
            throw new BadRequestException('Some users not found');
        }

        // Validate organization boundary for all users
        for (const targetUser of users) {
            if (targetUser.organization_id !== assignedBy.organization_id) {
                throw new ForbiddenException('Cannot assign users from other organizations');
            }

            // If assigner is a manager, can only assign team members
            if (assignedBy.role === UserRole.MANAGER && targetUser.manager_id !== assignedBy.id) {
                throw new ForbiddenException('Managers can only assign their own team members');
            }
        }

        // Create assignments (skip if already exists)
        for (const userId of assignDto.user_ids) {
            const existingAssignment = await this.projectAssignmentRepository.findOne({
                where: { user_id: userId, project_id: projectId },
            });

            if (!existingAssignment) {
                const assignment = this.projectAssignmentRepository.create({
                    user_id: userId,
                    project_id: projectId,
                    assigned_by: assignedBy.id,
                });

                await this.projectAssignmentRepository.save(assignment);
            }
        }
    }

    /**
     * Remove user from project
     */
    async removeUserFromProject(
        projectId: string,
        userId: string,
        removedBy: User,
    ): Promise<void> {
        const project = await this.projectRepository.findOne({
            where: { id: projectId },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // Validate organization boundary
        if (project.organization_id !== removedBy.organization_id) {
            throw new ForbiddenException('Cannot access projects from other organizations');
        }

        // Only admin or project creator can remove users
        if (removedBy.role !== UserRole.ADMIN && project.created_by !== removedBy.id) {
            throw new ForbiddenException('Only project creator or admin can remove users');
        }

        // Check if this is the user's last project
        const userAssignments = await this.projectAssignmentRepository.find({
            where: { user_id: userId },
        });

        if (userAssignments.length <= 1) {
            // This is the last project, auto-reassign to system project instead of removing
            const systemProject = await this.getSystemProject(removedBy.organization_id);

            const existingSystemAssignment = await this.projectAssignmentRepository.findOne({
                where: { user_id: userId, project_id: systemProject.id },
            });

            if (!existingSystemAssignment) {
                const assignment = this.projectAssignmentRepository.create({
                    user_id: userId,
                    project_id: systemProject.id,
                    assigned_by: removedBy.id,
                });

                await this.projectAssignmentRepository.save(assignment);
            }
        }

        // Remove assignment
        await this.projectAssignmentRepository.delete({
            user_id: userId,
            project_id: projectId,
        });
    }

    /**
     * Validate user has access to project
     */
    async validateProjectAccess(projectId: string, user: User): Promise<boolean> {
        const project = await this.projectRepository.findOne({
            where: { id: projectId },
            select: ['id', 'organization_id', 'created_by'],
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // Check organization boundary
        if (project.organization_id !== user.organization_id) {
            throw new ForbiddenException('Cannot access projects from other organizations');
        }

        // Admins can access all projects
        if (user.role === UserRole.ADMIN) {
            return true;
        }

        // Managers can access their own projects
        if (user.role === UserRole.MANAGER && project.created_by === user.id) {
            return true;
        }

        // Employees can access only assigned projects
        if (user.role === UserRole.EMPLOYEE) {
            const assignment = await this.projectAssignmentRepository.findOne({
                where: { user_id: user.id, project_id: projectId },
            });

            if (!assignment) {
                throw new ForbiddenException('You are not assigned to this project');
            }

            return true;
        }

        throw new ForbiddenException('Access denied to this project');
    }

    /**
     * Check if user is assigned to project
     */
    async isUserAssignedToProject(userId: string, projectId: string): Promise<boolean> {
        const assignment = await this.projectAssignmentRepository.findOne({
            where: { user_id: userId, project_id: projectId },
        });

        return !!assignment;
    }

    /**
     * Auto-assign system project to user (called during user creation)
     */
    async autoAssignSystemProject(userId: string, organizationId: string): Promise<void> {
        const systemProject = await this.getSystemProject(organizationId);

        const existingAssignment = await this.projectAssignmentRepository.findOne({
            where: { user_id: userId, project_id: systemProject.id },
        });

        if (!existingAssignment) {
            const assignment = this.projectAssignmentRepository.create({
                user_id: userId,
                project_id: systemProject.id,
                assigned_by: userId, // System assignment
            });

            await this.projectAssignmentRepository.save(assignment);
        }
    }
}
