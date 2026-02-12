import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    create(
        @Body() createProjectDto: CreateProjectDto,
        @CurrentUser() user: any,
    ) {
        return this.projectsService.create(
            createProjectDto,
            user.userId,
            user.organizationId,
        );
    }

    @Get()
    findAll(@CurrentUser() user: any) {
        return this.projectsService.findAll(user.organizationId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.projectsService.findOne(id, user.organizationId);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() updateProjectDto: UpdateProjectDto,
        @CurrentUser() user: any,
    ) {
        return this.projectsService.update(id, updateProjectDto, user.organizationId);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @CurrentUser() user: any) {
        await this.projectsService.remove(id, user.organizationId);
        return { message: 'Project deleted successfully' };
    }
}
