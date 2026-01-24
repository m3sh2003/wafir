import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Wafir Backend v1.1 (Debug: Deploy Check ' + new Date().toISOString() + ')';
  }
}
