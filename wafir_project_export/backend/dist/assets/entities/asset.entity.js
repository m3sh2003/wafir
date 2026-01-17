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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asset = exports.RiskLevel = exports.AssetType = void 0;
const typeorm_1 = require("typeorm");
const holding_entity_1 = require("./holding.entity");
var AssetType;
(function (AssetType) {
    AssetType["SUKUK"] = "Sukuk";
    AssetType["EQUITY"] = "Equity";
    AssetType["FUND"] = "Fund";
    AssetType["REAL_ESTATE"] = "Real Estate";
    AssetType["CASH"] = "Cash";
    AssetType["ETF"] = "ETF";
    AssetType["REIT"] = "REIT";
    AssetType["STOCK"] = "Stock";
    AssetType["CERTIFICATE"] = "Certificate";
    AssetType["CURRENCY"] = "Currency";
})(AssetType || (exports.AssetType = AssetType = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "Low";
    RiskLevel["MEDIUM"] = "Medium";
    RiskLevel["HIGH"] = "High";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
let Asset = class Asset {
    id;
    name;
    symbol;
    type;
    riskLevel;
    currentPrice;
    expectedReturn;
    minInvestment;
    description;
    isZakatable;
    isShariaCompliant;
    holdings;
    createdAt;
    updatedAt;
};
exports.Asset = Asset;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Asset.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Asset.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Asset.prototype, "symbol", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AssetType,
        default: AssetType.ETF
    }),
    __metadata("design:type", String)
], Asset.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RiskLevel,
        default: RiskLevel.MEDIUM
    }),
    __metadata("design:type", String)
], Asset.prototype, "riskLevel", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, default: 10.0 }),
    __metadata("design:type", Number)
], Asset.prototype, "currentPrice", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], Asset.prototype, "expectedReturn", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Asset.prototype, "minInvestment", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Asset.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Asset.prototype, "isZakatable", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Asset.prototype, "isShariaCompliant", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => holding_entity_1.Holding, holding => holding.asset),
    __metadata("design:type", Array)
], Asset.prototype, "holdings", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Asset.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Asset.prototype, "updatedAt", void 0);
exports.Asset = Asset = __decorate([
    (0, typeorm_1.Entity)('assets')
], Asset);
//# sourceMappingURL=asset.entity.js.map