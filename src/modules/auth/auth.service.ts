import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../entities/user.entity';
import { Organization } from '../../entities/organization.entity';
import { RegisterDto, LoginDto, ChangePasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { ProjectsService } from '../projects/projects.service';
import logger from '../../config/logger.config';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>,
        private readonly jwtService: JwtService,
        private readonly projectsService: ProjectsService,
    ) { }

    async register(registerDto: RegisterDto) {
        logger.info({ email: registerDto.email }, 'Registering new user');

        // Validate confirm_password
        if (registerDto.password !== registerDto.confirm_password) {
            throw new ConflictException('Password and confirm password do not match');
        }

        let organizationId = registerDto.organization_id;
        let isNewOrganization = false;

        // If no organization_id but organization_name provided, create new org
        if (!organizationId && registerDto.organization_name) {
            const org = this.organizationRepository.create({
                name: registerDto.organization_name,
                plan_type: 'free',
            });
            const savedOrg = await this.organizationRepository.save(org);
            organizationId = savedOrg.id;
            isNewOrganization = true;

            // Set role to ADMIN for the first user of a new organization
            if (!registerDto.role) {
                registerDto.role = UserRole.ADMIN;
            }
        }

        if (!organizationId) {
            throw new ConflictException('Organization ID or Name is required');
        }

        // Check if email already exists
        const existingEmail = await this.userRepository.findOne({
            where: {
                organization_id: organizationId,
                email: registerDto.email,
            },
        });

        if (existingEmail) {
            throw new ConflictException('Email already exists in this organization');
        }

        // Check if employee_id already exists
        const existingEmployeeId = await this.userRepository.findOne({
            where: {
                organization_id: organizationId,
                employee_id: registerDto.employee_id,
            },
        });

        if (existingEmployeeId) {
            throw new ConflictException('Employee ID already exists in this organization');
        }

        // Hash password
        const password_hash = await bcrypt.hash(registerDto.password, 12);

        // Create user
        const user = this.userRepository.create({
            email: registerDto.email,
            password_hash,
            first_name: registerDto.first_name,
            last_name: registerDto.last_name,
            employee_id: registerDto.employee_id,
            organization_id: organizationId,
            role: registerDto.role || UserRole.EMPLOYEE,
        });

        const savedUser = await this.userRepository.save(user);

        // If this is a new organization, create system project with user as creator
        if (isNewOrganization) {
            await this.projectsService.createSystemProject(organizationId, savedUser.id);
        }

        // Auto-assign system project to new user
        await this.projectsService.autoAssignSystemProject(savedUser.id, organizationId);

        logger.info({ userId: savedUser.id }, 'User registered successfully');

        // Generate JWT
        const token = this.generateToken(savedUser);

        return {
            user: this.sanitizeUser(savedUser),
            access_token: token,
        };
    }

    async login(loginDto: LoginDto) {
        logger.info({ email: loginDto.email }, 'User login attempt');

        // Find user by email only (no organization_id needed)
        const user = await this.userRepository.findOne({
            where: {
                email: loginDto.email,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(loginDto.password, user.password_hash);

        if (!isValidPassword) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Update last_seen
        await this.userRepository.update(user.id, { last_seen: new Date() });

        logger.info({ userId: user.id }, 'User logged in successfully');

        const token = this.generateToken(user);

        return {
            user: this.sanitizeUser(user),
            access_token: token,
        };
    }

    async changePassword(userId: string, dto: ChangePasswordDto) {
        logger.info({ userId }, 'User changing password');

        // Validate confirm_password
        if (dto.new_password !== dto.confirm_password) {
            throw new ConflictException('New password and confirm password do not match');
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Verify old password
        const isValidOldPassword = await bcrypt.compare(dto.old_password, user.password_hash);
        if (!isValidOldPassword) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        // Hash new password
        const password_hash = await bcrypt.hash(dto.new_password, 12);

        // Update password
        await this.userRepository.update(userId, { password_hash });

        logger.info({ userId }, 'Password changed successfully');

        return { message: 'Password changed successfully' };
    }

    async resetPassword(adminUserId: string, targetUserId: string, dto: ResetPasswordDto) {
        logger.info({ adminUserId, targetUserId }, 'Admin resetting user password');

        // Validate confirm_password
        if (dto.new_password !== dto.confirm_password) {
            throw new ConflictException('New password and confirm password do not match');
        }

        // Verify admin user
        const adminUser = await this.userRepository.findOne({ where: { id: adminUserId } });
        if (!adminUser || adminUser.role !== UserRole.ADMIN) {
            throw new UnauthorizedException('Only admins can reset passwords');
        }

        // Get target user
        const targetUser = await this.userRepository.findOne({ where: { id: targetUserId } });
        if (!targetUser) {
            throw new UnauthorizedException('Target user not found');
        }

        // Verify same organization
        if (adminUser.organization_id !== targetUser.organization_id) {
            throw new UnauthorizedException('Cannot reset password for users in other organizations');
        }

        // Hash new password
        const password_hash = await bcrypt.hash(dto.new_password, 12);

        // Update password
        await this.userRepository.update(targetUserId, { password_hash });

        logger.info({ targetUserId }, 'Password reset successfully by admin');

        return { message: 'Password reset successfully' };
    }

    async validateUser(userId: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return user;
    }

    private generateToken(user: User): string {
        const payload = {
            sub: user.id,
            email: user.email,
            organization_id: user.organization_id,
            role: user.role,
        };

        return this.jwtService.sign(payload);
    }

    private sanitizeUser(user: User) {
        const { password_hash, ...sanitized } = user;
        return sanitized;
    }
}
