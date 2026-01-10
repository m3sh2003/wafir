import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { Holding } from './entities/holding.entity';
import { PortfolioTarget } from './entities/portfolio-target.entity';
import { Asset } from './entities/asset.entity';

@Injectable()
export class AssetsService {
    constructor(
        @InjectRepository(Account)
        private accountRepo: Repository<Account>,
        @InjectRepository(Holding)
        private holdingRepo: Repository<Holding>,
        @InjectRepository(PortfolioTarget)
        private targetRepo: Repository<PortfolioTarget>,
        @InjectRepository(Asset)
        private assetRepo: Repository<Asset>,
    ) { }

    async findAllAssets() {
        return this.assetRepo.find();
    }

    async findAssetById(id: string) {
        return this.assetRepo.findOneBy({ id });
    }

    async findAllAccounts(userId: string) {
        return this.accountRepo.find({ where: { userId }, relations: ['holdings'] });
    }

    async createAccount(userId: string, data: Partial<Account>) {
        const account = this.accountRepo.create({ ...data, userId });
        return this.accountRepo.save(account);
    }

    async findAllHoldings(userId: string) {
        return this.holdingRepo.find({
            where: { account: { userId } },
            relations: ['account', 'asset']
        });
    }

    async createHolding(accountId: number, data: Partial<Holding>) {
        const holding = this.holdingRepo.create({ ...data, accountId });
        return this.holdingRepo.save(holding);
    }

    async getPortfolioTargets(userId: string) {
        return this.targetRepo.find({ where: { userId } });
    }

    async setPortfolioTarget(userId: string, targets: Partial<PortfolioTarget>[]) {
        // Clear existing and save new. Ideally should be usage smarter merge.
        await this.targetRepo.delete({ userId });
        const newTargets = targets.map(t => this.targetRepo.create({ ...t, userId }));
        return this.targetRepo.save(newTargets);
    }
}
