"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const account_entity_1 = require("./entities/account.entity");
const holding_entity_1 = require("./entities/holding.entity");
const portfolio_target_entity_1 = require("./entities/portfolio-target.entity");
const asset_entity_1 = require("./entities/asset.entity");
let AssetsService = class AssetsService {
    accountRepo;
    holdingRepo;
    targetRepo;
    assetRepo;
    constructor(accountRepo, holdingRepo, targetRepo, assetRepo) {
        this.accountRepo = accountRepo;
        this.holdingRepo = holdingRepo;
        this.targetRepo = targetRepo;
        this.assetRepo = assetRepo;
    }
    async findAllAssets() {
        return this.assetRepo.find();
    }
    async findAssetById(id) {
        return this.assetRepo.findOneBy({ id });
    }
    async findAllAccounts(userId) {
        return this.accountRepo.find({ where: { userId }, relations: ['holdings'] });
    }
    async createAccount(userId, data) {
        const account = this.accountRepo.create({ ...data, userId });
        return this.accountRepo.save(account);
    }
    async findAllHoldings(userId) {
        return this.holdingRepo.find({
            where: { account: { userId } },
            relations: ['account', 'asset']
        });
    }
    async createHolding(accountId, data) {
        const holding = this.holdingRepo.create({ ...data, accountId });
        return this.holdingRepo.save(holding);
    }
    async getPortfolioTargets(userId) {
        return this.targetRepo.find({ where: { userId } });
    }
    async setPortfolioTarget(userId, targets) {
        await this.targetRepo.delete({ userId });
        const newTargets = targets.map(t => this.targetRepo.create({ ...t, userId }));
        return this.targetRepo.save(newTargets);
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(account_entity_1.Account)),
    __param(1, (0, typeorm_1.InjectRepository)(holding_entity_1.Holding)),
    __param(2, (0, typeorm_1.InjectRepository)(portfolio_target_entity_1.PortfolioTarget)),
    __param(3, (0, typeorm_1.InjectRepository)(asset_entity_1.Asset)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AssetsService);
//# sourceMappingURL=assets.service.js.map