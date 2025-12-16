import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProxyService } from './proxy.service';
import { ProxyController } from './proxy.controller';
import { CacheModule } from '../cache/cache.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [HttpModule, CacheModule, AuthModule],
    providers: [ProxyService],
    controllers: [ProxyController],
})
export class ProxyModule { }