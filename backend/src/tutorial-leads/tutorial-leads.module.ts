import { Module } from '@nestjs/common';
import { TutorialLeadsController } from './tutorial-leads.controller';
import { TutorialLeadsService } from './tutorial-leads.service';

@Module({
  controllers: [TutorialLeadsController],
  providers: [TutorialLeadsService],
})
export class TutorialLeadsModule {}
