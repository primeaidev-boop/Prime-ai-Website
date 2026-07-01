import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const KEY = 'projects_data';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async getData(): Promise<Record<string, unknown> | null> {
    const row = await this.prisma.siteSetting.findUnique({ where: { key: KEY } });
    if (!row) return null;
    try {
      return JSON.parse(row.value) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  async saveData(data: Record<string, unknown>): Promise<void> {
    const value = JSON.stringify(data);
    await this.prisma.siteSetting.upsert({
      where: { key: KEY },
      update: { value },
      create: { key: KEY, value },
    });
  }
}
