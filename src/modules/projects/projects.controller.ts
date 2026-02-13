import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, AssignProjectDto } from './dto/project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    async create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
        return this.projectsService.create(createProjectDto, req.user);
    }

    @Get()
    async findAll(@Request() req) {
        return this.projectsService.findAll(req.user);
    }

    @Get('system')
    async getSystemProject(@Request() req) {
        return this.projectsService.getSystemProject(req.user.organization_id);
    }

    @Get(':id')
    async findOne(@Param('id') projectId: string, @Request() req) {
        return this.projectsService.findOne(projectId, req.user);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    async update(
        @Param('id') projectId: string,
        @Body() updateProjectDto: UpdateProjectDto,
        @Request() req,
    ) {
        return this.projectsService.update(projectId, updateProjectDto, req.user);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async archive(@Param('id') projectId: string, @Request() req) {
        await this.projectsService.archive(projectId, req.user);
        return { message: 'Project archived successfully' };
    }

    @Post(':id/assign')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    async assignUsers(
        @Param('id') projectId: string,
        @Body() assignDto: AssignProjectDto,
        @Request() req,
    ) {
        await this.projectsService.assignUsersToProject(projectId, assignDto, req.user);
        return { message: 'Users assigned successfully' };
    }

    @Delete(':id/assign/:userId')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    async removeUser(
        @Param('id') projectId: string,
        @Param('userId') userId: string,
        @Request() req,
    ) {
        await this.projectsService.removeUserFromProject(projectId, userId, req.user);
        return { message: 'User removed from project successfully' };
    }
}
