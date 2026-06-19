// Auth controller - login sets httpOnly cookie, logout clears it, me verifies session

import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Response, Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

const COOKIE_NAME = 'admin_token';
const COOKIE_MAX_AGE = 8 * 60 * 60 * 1000; // 8 hours

function cookieOptions(_req: ExpressRequest) {
  // Use HTTPS_ENABLED, not NODE_ENV — on HTTP the Secure flag causes the browser
  // to silently drop the cookie on every subsequent request, breaking all protected routes
  const isHttps = process.env.HTTPS_ENABLED === 'true';
  return {
    httpOnly: true,
    secure: isHttps,
    sameSite: (isHttps ? 'none' : 'lax') as 'none' | 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 5 attempts per 15 minutes per IP — brute force protection
  @Throttle({ default: { ttl: 15 * 60 * 1000, limit: 5 } })
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Request() req: ExpressRequest,
  ) {
    const { access_token, admin } = await this.authService.login(
      dto.email,
      dto.password,
    );
    res.cookie(COOKIE_NAME, access_token, cookieOptions(req));
    return { admin };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return { message: 'Logged out' };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: ExpressRequest & { user: { id: string; email: string; name: string } }) {
    const { id, email, name } = req.user;
    return { admin: { id, email, name } };
  }
}
