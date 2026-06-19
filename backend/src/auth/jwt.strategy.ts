// JWT strategy - extracts token from httpOnly cookie on protected routes

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from './auth.service';

interface JwtPayload {
  sub: string;
  email: string;
}

function extractFromCookie(req: Request): string | null {
  return (req.cookies as Record<string, string>)?.admin_token ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(), // fallback for Swagger/testing
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? (() => { throw new Error('JWT_SECRET env var is required'); })(),
      passReqToCallback: false,
    });
  }

  async validate(payload: JwtPayload) {
    const admin = await this.authService.validateAdmin(payload.sub);
    if (!admin) throw new UnauthorizedException();
    return admin;
  }
}
