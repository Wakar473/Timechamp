import { Controller, Post, Body, HttpCode, HttpStatus, Put, Param, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ChangePasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Put('password')
    @UseGuards(JwtAuthGuard)
    async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
        return this.authService.changePassword(req.user.id, dto);
    }

    @Put('reset-password/:userId')
    @UseGuards(JwtAuthGuard)
    async resetPassword(@Req() req, @Param('userId') userId: string, @Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(req.user.id, userId, dto);
    }
}
