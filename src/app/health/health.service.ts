import { Injectable } from '@nestjs/common';
import { TypeOrmHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { CommonHealthIndicator } from './common.indicator';

@Injectable()
export class HealthService {
  constructor(
    private readonly typeormHealth: TypeOrmHealthIndicator,
    private readonly commonHealth: CommonHealthIndicator,
  ) {}

  public async getDBHealthCheck() {
    return () => this.typeormHealth.pingCheck('MySQL Database');
  }

  public async getCommon() {
    return () => this.commonHealth.isHealthy('ping');
  }
}
