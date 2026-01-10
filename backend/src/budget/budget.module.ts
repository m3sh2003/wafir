import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { Envelope } from './entities/envelope.entity';
import { Transaction } from './entities/transaction.entity';
import { Category } from './entities/category.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Envelope, Transaction, Category])],
    controllers: [BudgetController],
    providers: [BudgetService],
    exports: [BudgetService],
})
export class BudgetModule { }
