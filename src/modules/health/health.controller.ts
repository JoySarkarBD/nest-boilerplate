/**
 * @fileoverview Health controller - provides a simple endpoint for checking the health status of the application.
 */
import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

/**
 * HealthController provides HTTP endpoints for managing health check resources.
 */
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * GET /health
   *
   * @returns An object containing the health status, uptime, and memory usage of the application.
   */
  @Get()
  check() {
    return this.healthService.getHealth();
  }
}
