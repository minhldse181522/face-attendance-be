import { Module } from '@nestjs/common';
import { RateLimitModuleClass } from './rate-limit.module-definition';
import { RateLimitService } from './rate-limit.service';

@Module({
  providers: [RateLimitService],
  exports: [RateLimitService],
})
export class RateLimitModule extends RateLimitModuleClass {}
