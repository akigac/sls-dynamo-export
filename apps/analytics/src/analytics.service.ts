import { Injectable } from '@nestjs/common';
import { ServiceLogDecorator } from '../../lib/serviceLogDecorator'

@Injectable()
export class AnalyticsService {
  
  @ServiceLogDecorator()
  getHello(): string {
    return 'Hello World!';
  }
  getWorld(): string {
    return 'Hello World2!';
  }
}
