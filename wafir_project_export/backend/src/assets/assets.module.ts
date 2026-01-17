import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { Account } from './entities/account.entity';
import { Holding } from './entities/holding.entity';
import { PortfolioTarget } from './entities/portfolio-target.entity';
import { Asset } from './entities/asset.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Account, Holding, PortfolioTarget, Asset])],
    controllers: [AssetsController],
    providers: [AssetsService],
    exports: [AssetsService],
})
export class AssetsModule { }
