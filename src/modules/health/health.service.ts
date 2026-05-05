/**
 * @fileoverview Health check controller and service.
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth() {
    return {
      message: 'Application is healthy',
      data: {
        status: 'ok',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
    };
  }
}
