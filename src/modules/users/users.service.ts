import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../../entities';
import { InviteUserDto, UpdateUserRoleDto, UpdateUserStatusDto, AssignManagerDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @Inject(forwardRef(() => require('../projects/projects.service').ProjectsService))
        private projectsService: any,
    ) { }

    /**
     * Get all users with role-based filtering
     */
    async getAllUsers(organizationId: string, currentUserId: string, currentUserRole: UserRole): Promise<User[]> {
        const query = this.userRepository
            .createQueryBuilder('user')
            .where('user.organization_id = :organizationId', { organizationId })
            .select([
                'user.id',
                'user.email',
                'user.name',
                'user.role',
                'user.status',
                'user.manager_id',
                'user.last_seen',
                'user.created_at',
            ]);

        // Apply role-based filtering
        if (currentUserRole === UserRole.MANAGER) {
            // Managers see only their team members
            query.andWhere('user.manager_id = :currentUserId', { currentUserId });
        } else if (currentUserRole === UserRole.EMPLOYEE) {
            // Employees should not call this endpoint, but if they do, return only themselves
            query.andWhere('user.id = :currentUserId', { currentUserId });
        }
        // Admins see all users (no additional filter)

        return await query.orderBy('user.created_at', 'DESC').getMany();
    }

    /**
     * Get team members for a manager
     */
    async getTeamMembers(managerId: string): Promise<User[]> {
        return await this.userRepository.find({
            where: { manager_id: managerId },
            select: ['id', 'email', 'first_name', 'last_name', 'employee_id', 'role', 'status', 'last_seen', 'created_at'],
            order: { created_at: 'DESC' },
        });
    }

    /**
     * Get online users (last_seen within last 5 minutes)
     */
    async getOnlineUsers(organizationId: string, currentUserId: string, currentUserRole: UserRole): Promise<User[]> {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const query = this.userRepository
            .createQueryBuilder('user')
            .where('user.organization_id = :organizationId', { organizationId })
            .andWhere('user.last_seen > :fiveMinutesAgo', { fiveMinutesAgo })
            .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
            .select(['user.id', 'user.email', 'user.first_name', 'user.last_name', 'user.employee_id', 'user.role', 'user.last_seen']);

        // Apply role-based filtering
        if (currentUserRole === UserRole.MANAGER) {
            query.andWhere('user.manager_id = :currentUserId', { currentUserId });
        } else if (currentUserRole === UserRole.EMPLOYEE) {
            query.andWhere('user.id = :currentUserId', { currentUserId });
        }

        return await query.getMany();
    }

    /**
     * Get assignable employees for project assignment
     * Admin: All active employees in organization
     * Manager: Only their active team members
     */
    async getAssignableEmployees(
        organizationId: string,
        currentUserId: string,
        currentUserRole: UserRole,
    ): Promise<User[]> {
        const query = this.userRepository
            .createQueryBuilder('user')
            .where('user.organization_id = :organizationId', { organizationId })
            .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
            .andWhere('user.role = :role', { role: UserRole.EMPLOYEE })
            .select([
                'user.id',
                'user.email',
                'user.name',
                'user.role',
                'user.manager_id',
            ]);

        // Apply role-based filtering
        if (currentUserRole === UserRole.MANAGER) {
            // Managers see only their team members
            query.andWhere('user.manager_id = :currentUserId', { currentUserId });
        }
        // Admins see all employees (no additional filter)

        return await query.orderBy('user.name', 'ASC').getMany();
    }

    /**
     * Invite a new user
     * Admin: Can invite anyone and assign to any manager
     * Manager: Can only invite employees to their own team
     */
    async inviteUser(
        inviteDto: InviteUserDto,
        invitedBy: User,
    ): Promise<User> {
        // Managers can only invite employees (not admins or other managers)
        if (invitedBy.role === UserRole.MANAGER) {
            if (inviteDto.role !== UserRole.EMPLOYEE) {
                throw new ForbiddenException('Managers can only invite employees');
            }

            // Force manager to assign employee to themselves
            if (inviteDto.manager_id && inviteDto.manager_id !== invitedBy.id) {
                throw new ForbiddenException('Managers can only invite employees to their own team');
            }

            // Auto-assign to the inviting manager
            inviteDto.manager_id = invitedBy.id;
        }

        // Validate manager assignment for employees
        if (inviteDto.role === UserRole.EMPLOYEE) {
            if (!inviteDto.manager_id) {
                throw new BadRequestException('Employees must be assigned to a manager');
            }

            // Verify manager exists and is in same organization
            const manager = await this.userRepository.findOne({
                where: { id: inviteDto.manager_id },
                select: ['id', 'role', 'organization_id'],
            });

            if (!manager) {
                throw new NotFoundException('Manager not found');
            }

            if (manager.organization_id !== invitedBy.organization_id) {
                throw new ForbiddenException('Cannot assign employee to manager from another organization');
            }

            if (manager.role !== UserRole.MANAGER && manager.role !== UserRole.ADMIN) {
                throw new BadRequestException('Assigned manager must have MANAGER or ADMIN role');
            }
        }

        // Check if user already exists
        const existingUser = await this.userRepository.findOne({
            where: {
                email: inviteDto.email,
                organization_id: invitedBy.organization_id,
            },
        });

        if (existingUser) {
            throw new BadRequestException('User with this email already exists in your organization');
        }

        // Check employee_id uniqueness
        const existingEmployeeId = await this.userRepository.findOne({
            where: {
                organization_id: invitedBy.organization_id,
                employee_id: inviteDto.employee_id,
            },
        });

        if (existingEmployeeId) {
            throw new BadRequestException('Employee ID already exists in your organization');
        }

        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-10);
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        const newUser = this.userRepository.create({
            email: inviteDto.email,
            first_name: inviteDto.first_name,
            last_name: inviteDto.last_name,
            employee_id: inviteDto.employee_id,
            role: inviteDto.role,
            password_hash: hashedPassword,
            organization_id: invitedBy.organization_id,
            manager_id: inviteDto.manager_id,
            status: UserStatus.ACTIVE,
        });

        const savedUser = await this.userRepository.save(newUser);

        // Auto-assign system project to new employees
        if (inviteDto.role === UserRole.EMPLOYEE) {
            try {
                await this.projectsService.autoAssignSystemProject(
                    savedUser.id,
                    invitedBy.organization_id,
                );
            } catch (error) {
                console.error('Failed to auto-assign system project:', error.message);
                // Don't fail the invite if system project assignment fails
            }
        }

        // TODO: Send email with temporary password
        console.log(`Temporary password for ${inviteDto.email}: ${tempPassword}`);

        return savedUser;
    }

    /**
     * Update user role (admin only)
     */
    async updateUserRole(
        userId: string,
        updateRoleDto: UpdateUserRoleDto,
        updatedBy: User,
    ): Promise<User> {
        if (updatedBy.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Only admins can change user roles');
        }

        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'organization_id', 'role'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.organization_id !== updatedBy.organization_id) {
            throw new ForbiddenException('Cannot modify users from other organizations');
        }

        user.role = updateRoleDto.role;
        return await this.userRepository.save(user);
    }

    /**
     * Update user status (admin only)
     */
    async updateUserStatus(
        userId: string,
        updateStatusDto: UpdateUserStatusDto,
        updatedBy: User,
    ): Promise<User> {
        if (updatedBy.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Only admins can change user status');
        }

        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.organization_id !== updatedBy.organization_id) {
            throw new ForbiddenException('Cannot modify users from other organizations');
        }

        user.status = updateStatusDto.status as UserStatus;
        return await this.userRepository.save(user);
    }

    /**
     * Assign manager to employee (admin only)
     */
    async assignManager(
        userId: string,
        assignManagerDto: AssignManagerDto,
        assignedBy: User,
    ): Promise<User> {
        if (assignedBy.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Only admins can reassign managers');
        }

        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.organization_id !== assignedBy.organization_id) {
            throw new ForbiddenException('Cannot modify users from other organizations');
        }

        // Verify new manager exists
        const manager = await this.userRepository.findOne({
            where: { id: assignManagerDto.manager_id },
            select: ['id', 'role', 'organization_id'],
        });

        if (!manager) {
            throw new NotFoundException('Manager not found');
        }

        if (manager.organization_id !== assignedBy.organization_id) {
            throw new ForbiddenException('Cannot assign employee to manager from another organization');
        }

        if (manager.role !== UserRole.MANAGER && manager.role !== UserRole.ADMIN) {
            throw new BadRequestException('Assigned user must have MANAGER or ADMIN role');
        }

        user.manager_id = assignManagerDto.manager_id;
        return await this.userRepository.save(user);
    }

    /**
     * Update last seen timestamp
     */
    async updateLastSeen(userId: string): Promise<void> {
        await this.userRepository.update(userId, {
            last_seen: new Date(),
        });
    }

    /**
     * Get user by ID
     */
    async findById(userId: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }
}
