import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

const KEY = 'tutorial_data';

@Injectable()
export class TutorialsService {
  private readonly logger = new Logger(TutorialsService.name);

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
    this.notifyLms();
  }

  /** Fire-and-forget ping so the LMS re-pulls tutorial content immediately.
   * Never throws - an admin save must succeed even if the LMS is unreachable;
   * the LMS also polls on its own as a fallback. */
  private notifyLms(): void {
    const url = process.env.LMS_SYNC_WEBHOOK_URL;
    const secret = process.env.LMS_SYNC_WEBHOOK_SECRET;
    if (!url || !secret) return;

    axios
      .post(url, {}, { headers: { 'x-sync-key': secret }, timeout: 5000 })
      .catch((err) => {
        this.logger.warn(`LMS tutorial sync webhook failed: ${err.message}`);
      });
  }
}
