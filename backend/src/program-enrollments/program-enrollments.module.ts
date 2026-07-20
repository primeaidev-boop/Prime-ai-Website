import { Module } from '@nestjs/common';
import { ProgramEnrollmentsController } from './program-enrollments.controller';
import { ProgramEnrollmentsService } from './program-enrollments.service';

@Module({
  controllers: [ProgramEnrollmentsController],
  providers: [ProgramEnrollmentsService],
})
export class ProgramEnrollmentsModule {}
