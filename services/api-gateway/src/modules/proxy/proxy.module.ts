// src/modules/proxy/proxy.module.ts

import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProxyService } from './proxy.service';

@Global()
@Module({
    imports: [
        HttpModule.register({
            timeout: 30000,
            maxRedirects: 3,
        }),
    ],
    providers: [ProxyService],
    exports: [ProxyService],
})
export class ProxyModule {}
