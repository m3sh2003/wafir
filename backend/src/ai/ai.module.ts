import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { UsersModule } from '../users/users.module'; // To access UsersService
import { BudgetModule } from '../budget/budget.module';
import { AssetsModule } from '../assets/assets.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule,
        UsersModule,
        BudgetModule,
        AssetsModule,
    ],
    controllers: [AiController],
    providers: [AiService],
    exports: [AiService],
})
export class AiModule { }
