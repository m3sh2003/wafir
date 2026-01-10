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
exports.Holding = void 0;
const typeorm_1 = require("typeorm");
const account_entity_1 = require("./account.entity");
const asset_entity_1 = require("./asset.entity");
let Holding = class Holding {
    id;
    instrumentCode;
    asset;
    assetId;
    units;
    isPrimaryHome;
    account;
    accountId;
};
exports.Holding = Holding;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Holding.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'instrument_code' }),
    __metadata("design:type", String)
], Holding.prototype, "instrumentCode", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => asset_entity_1.Asset, asset => asset.holdings, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'asset_id' }),
    __metadata("design:type", asset_entity_1.Asset)
], Holding.prototype, "asset", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'asset_id', nullable: true }),
    __metadata("design:type", String)
], Holding.prototype, "assetId", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 18, scale: 6 }),
    __metadata("design:type", Number)
], Holding.prototype, "units", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_primary_home', default: false }),
    __metadata("design:type", Boolean)
], Holding.prototype, "isPrimaryHome", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => account_entity_1.Account, account => account.holdings, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'account_id' }),
    __metadata("design:type", account_entity_1.Account)
], Holding.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_id' }),
    __metadata("design:type", Number)
], Holding.prototype, "accountId", void 0);
exports.Holding = Holding = __decorate([
    (0, typeorm_1.Entity)('holdings')
], Holding);
//# sourceMappingURL=holding.entity.js.map