import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import * as crypto from 'crypto';

@Injectable()
export class IdempotenceService {
  private readonly PROCESSED_PREFIX = 'event:processed:';
  private readonly TTL_SECONDS = 7 * 24 * 60 * 60;

  constructor(@InjectRedis() private readonly redis: Redis) { }

  async isDuplicate(eventId: string): Promise<boolean> {
    const key = `${this.PROCESSED_PREFIX}${eventId}`;
    const exists = await this.redis.exists(key);
    return exists === 1;
  }

  async markProcessed(eventId: string, eventType: string, data: any): Promise<void> {
    const key = `${this.PROCESSED_PREFIX}${eventId}`;
    const value = JSON.stringify({
      eventType,
      processedAt: new Date().toISOString(),
      dataChecksum: this.checksum(data),
    });

    await this.redis.setex(key, this.TTL_SECONDS, value);
  }

  private checksum(data: any): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }
}