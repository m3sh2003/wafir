import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestmentsService } from './investments.service';
import { InvestmentsController } from './investments.controller';

import { UserPortfolio } from './entities/portfolio.entity';

import { User } from '../users/entities/user.entity';

import { AssetsModule } from '../assets/assets.module';

@Module({
    imports: [TypeOrmModule.forFeature([UserPortfolio, User]), AssetsModule],
    controllers: [InvestmentsController],
    providers: [InvestmentsService],
    exports: [TypeOrmModule, InvestmentsService]
})
export class InvestmentsModule { }
