import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards';
import { Public } from './decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // envelope data must be exactly { user, tokens } for the frontend LoginResponse
  @Post('login')
  @Public()
  login(@Body() body: { username: string; password: string }) {
    const { user, accessToken, refreshToken } = this.auth.login(body.username, body.password);
    return { user, tokens: { accessToken, refreshToken } };
  }

  @Post('refresh')
  @Public()
  refresh(@Body() body: { refreshToken: string }) {
    return this.auth.refresh(body.refreshToken);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Body() body: { username: string; currentPassword: string; newPassword: string }): { message: string } {
    this.auth.changePassword(body.username, body.currentPassword, body.newPassword);
    return { message: 'Password changed successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request) {
    return this.auth.me((req.user as { id: string }).id);
  }
}