import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
    constructor(private dataSource: DataSource) { }

    @Get('db')
    async checkDb() {
        try {
            if (!this.dataSource.isInitialized) {
                return { status: 'error', message: 'DataSource not initialized' };
            }
            const result = await this.dataSource.query('SELECT 1 as res');
            return {
                status: 'ok',
                db_response: result,
                ssl: (this.dataSource.options as any).ssl,
                // Do not expose full password, but maybe host/user
                config: {
                    host: (this.dataSource.options as any).host,
                    username: (this.dataSource.options as any).username,
                    database: (this.dataSource.options as any).database,
                    ssl_option: (this.dataSource.options as any).ssl
                }
            };
        } catch (error: any) {
            return {
                status: 'error',
                message: error.message,
                stack: error.stack
            };
        }
    }
}
