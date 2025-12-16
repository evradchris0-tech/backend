import { Injectable } from '@nestjs/common';

type EventHandler = (data: any) => Promise<void>;

@Injectable()
export class EventHandlerRegistry {
    private handlers: Map<string, EventHandler> = new Map();

    registerHandler(eventType: string, handler: EventHandler): void {
        this.handlers.set(eventType, handler);
        console.log(`✅ Registered handler: ${eventType}`);
    }

    getHandler(eventType: string): EventHandler | undefined {
        return this.handlers.get(eventType);
    }
}