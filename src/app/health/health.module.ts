import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HealthService } from './health.service';
import { CommonHealthIndicator } from './common.indicator';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [HealthService, CommonHealthIndicator],
})
export class HealthModule {}
