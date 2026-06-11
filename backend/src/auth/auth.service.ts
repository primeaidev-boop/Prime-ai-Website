// Auth service — login with bcrypt verification and JWT signing

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: admin.id, email: admin.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    };
  }

  async validateAdmin(id: string) {
    return this.prisma.admin.findUnique({ where: { id } });
  }
}
