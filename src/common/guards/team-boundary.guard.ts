import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities';

/**
 * TeamBoundaryGuard ensures that managers can only access their own team members.
 * This guard should be used on endpoints where a manager is accessing user-specific data.
 * 
 * The guard looks for 'userId' or 'id' in route params or request body to validate
 * that the user being accessed is part of the manager's team.
 * 
 * Admins bypass this check and can access all users.
 */
@Injectable()
export class TeamBoundaryGuard implements CanActivate {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const currentUser = request.user;

        if (!currentUser) {
            throw new ForbiddenException('User not authenticated');
        }

        // Admins can access all users
        if (currentUser.role === UserRole.ADMIN) {
            return true;
        }

        // Employees should not be using this guard (they can only access their own data)
        if (currentUser.role === UserRole.EMPLOYEE) {
            throw new ForbiddenException('Employees cannot access other users');
        }

        // Extract target user ID from params or body
        const targetUserId = request.params.userId || request.params.id || request.body?.user_id;

        if (!targetUserId) {
            // If no specific user is being accessed, allow (will be filtered at service level)
            return true;
        }

        // For managers, verify the target user is in their team
        if (currentUser.role === UserRole.MANAGER) {
            const targetUser = await this.userRepository.findOne({
                where: { id: targetUserId },
                select: ['id', 'manager_id', 'organization_id'],
            });

            if (!targetUser) {
                throw new BadRequestException('User not found');
            }

            // Check organization boundary
            if (targetUser.organization_id !== currentUser.organization_id) {
                throw new ForbiddenException('Cannot access users from other organizations');
            }

            // Check team boundary
            if (targetUser.manager_id !== currentUser.id && targetUser.id !== currentUser.id) {
                throw new ForbiddenException('You can only access your own team members');
            }

            return true;
        }

        return false;
    }
}
