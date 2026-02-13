import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TeamBoundaryGuard } from '../../common/guards/team-boundary.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { UsersService } from './users.service';
import { InviteUserDto, UpdateUserRoleDto, UpdateUserStatusDto, AssignManagerDto } from './dto/user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    async getAllUsers(@Request() req) {
        return this.usersService.getAllUsers(
            req.user.organization_id,
            req.user.id,
            req.user.role,
        );
    }

    @Get('online')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    async getOnlineUsers(@Request() req) {
        return this.usersService.getOnlineUsers(
            req.user.organization_id,
            req.user.id,
            req.user.role,
        );
    }

    @Get('assignable')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    async getAssignableEmployees(@Request() req) {
        return this.usersService.getAssignableEmployees(
            req.user.organization_id,
            req.user.id,
            req.user.role,
        );
    }

    @Post('invite')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    async inviteUser(@Body() inviteDto: InviteUserDto, @Request() req) {
        return this.usersService.inviteUser(inviteDto, req.user);
    }

    @Patch(':id/role')
    @Roles(UserRole.ADMIN)
    @UseGuards(TeamBoundaryGuard)
    async updateUserRole(
        @Param('id') userId: string,
        @Body() updateRoleDto: UpdateUserRoleDto,
        @Request() req,
    ) {
        return this.usersService.updateUserRole(userId, updateRoleDto, req.user);
    }

    @Patch(':id/status')
    @Roles(UserRole.ADMIN)
    @UseGuards(TeamBoundaryGuard)
    async updateUserStatus(
        @Param('id') userId: string,
        @Body() updateStatusDto: UpdateUserStatusDto,
        @Request() req,
    ) {
        return this.usersService.updateUserStatus(userId, updateStatusDto, req.user);
    }

    @Patch(':id/manager')
    @Roles(UserRole.ADMIN)
    async assignManager(
        @Param('id') userId: string,
        @Body() assignManagerDto: AssignManagerDto,
        @Request() req,
    ) {
        return this.usersService.assignManager(userId, assignManagerDto, req.user);
    }

    @Get(':id')
    @UseGuards(TeamBoundaryGuard)
    async getUserById(@Param('id') userId: string) {
        return this.usersService.findById(userId);
    }
}
