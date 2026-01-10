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
exports.PortfolioTarget = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let PortfolioTarget = class PortfolioTarget {
    id;
    assetClass;
    targetPct;
    user;
    userId;
};
exports.PortfolioTarget = PortfolioTarget;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PortfolioTarget.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'asset_class' }),
    __metadata("design:type", String)
], PortfolioTarget.prototype, "assetClass", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 5, scale: 2, name: 'target_pct' }),
    __metadata("design:type", Number)
], PortfolioTarget.prototype, "targetPct", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], PortfolioTarget.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], PortfolioTarget.prototype, "userId", void 0);
exports.PortfolioTarget = PortfolioTarget = __decorate([
    (0, typeorm_1.Entity)('portfolio_targets')
], PortfolioTarget);
//# sourceMappingURL=portfolio-target.entity.js.map