// ============================================
// services/api-gateway/src/proxy/proxy.module.ts
// ============================================
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';

@Module({
    imports: [
        HttpModule.register({
            timeout: 10000,
            maxRedirects: 5,
        }),
        ConfigModule,
    ],
    controllers: [ProxyController],
    providers: [ProxyService],
})
export class ProxyModule { }