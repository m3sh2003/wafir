import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BudgetModule } from './budget/budget.module';
import { InvestmentsModule } from './investments/investments.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ZakatModule } from './zakat/zakat.module';
import { AssetsModule } from './assets/assets.module';
import { RulesModule } from './rules/rules.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      port: 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'wafir',
      autoLoadEntities: true,
      synchronize: true, // Only for dev!
    }),
    AuthModule,
    UsersModule,
    BudgetModule,
    InvestmentsModule,
    SchedulerModule,

    ZakatModule,
    AssetsModule,
    RulesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
