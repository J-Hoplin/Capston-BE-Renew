import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
} from '@nestjs/terminus';

@Controller('health')
@ApiTags('Health Checker')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly healthService: HealthService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Check ping health, database connection health status',
  })
  @HealthCheck()
  public async getHealthCheck(): Promise<HealthCheckResult> {
    return this.health.check([
      await this.healthService.getCommon(),
      await this.healthService.getDBHealthCheck(),
    ]);
  }

  @Get('/ping')
  @ApiOperation({
    summary: 'Check ping health',
  })
  @HealthCheck()
  public async getPingChekc(): Promise<HealthCheckResult> {
    return this.health.check([await this.healthService.getCommon()]);
  }

  @Get('/db')
  @ApiOperation({
    summary: 'Database conneciton status',
  })
  @HealthCheck()
  public async getDBhealthCheck(): Promise<HealthCheckResult> {
    return this.health.check([await this.healthService.getDBHealthCheck()]);
  }
}
