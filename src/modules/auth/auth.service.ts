import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../entities/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import logger from '../../config/logger.config';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        logger.info({ email: registerDto.email }, 'Registering new user');

        // Check if user already exists
        const existing = await this.userRepository.findOne({
            where: {
                organization_id: registerDto.organization_id,
                email: registerDto.email,
            },
        });

        if (existing) {
            throw new ConflictException('User with this email already exists in the organization');
        }

        // Hash password
        const password_hash = await bcrypt.hash(registerDto.password, 12);

        // Create user
        const user = this.userRepository.create({
            email: registerDto.email,
            password_hash,
            name: registerDto.name,
            organization_id: registerDto.organization_id,
            role: registerDto.role || UserRole.EMPLOYEE,
        });

        const savedUser = await this.userRepository.save(user);

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

        const user = await this.userRepository.findOne({
            where: {
                organization_id: loginDto.organization_id,
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
