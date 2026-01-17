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
exports.TransferRule = exports.RuleActionType = exports.RuleConditionType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
var RuleConditionType;
(function (RuleConditionType) {
    RuleConditionType["INCOME_RECEIVED"] = "INCOME_RECEIVED";
    RuleConditionType["MONTHLY_DATE"] = "MONTHLY_DATE";
    RuleConditionType["BALANCE_ABOVE"] = "BALANCE_ABOVE";
    RuleConditionType["BALANCE_BELOW"] = "BALANCE_BELOW";
})(RuleConditionType || (exports.RuleConditionType = RuleConditionType = {}));
var RuleActionType;
(function (RuleActionType) {
    RuleActionType["TRANSFER_PERCENTAGE"] = "TRANSFER_PERCENTAGE";
    RuleActionType["TRANSFER_FIXED"] = "TRANSFER_FIXED";
    RuleActionType["ALERT_ONLY"] = "ALERT_ONLY";
    RuleActionType["CATEGORIZE"] = "CATEGORIZE";
})(RuleActionType || (exports.RuleActionType = RuleActionType = {}));
let TransferRule = class TransferRule {
    id;
    name;
    user;
    userId;
    conditionType;
    conditionValue;
    actionType;
    actionValue;
    isActive;
    createdAt;
    updatedAt;
};
exports.TransferRule = TransferRule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TransferRule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TransferRule.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], TransferRule.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TransferRule.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RuleConditionType,
        default: RuleConditionType.MONTHLY_DATE
    }),
    __metadata("design:type", String)
], TransferRule.prototype, "conditionType", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], TransferRule.prototype, "conditionValue", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RuleActionType,
        default: RuleActionType.TRANSFER_PERCENTAGE
    }),
    __metadata("design:type", String)
], TransferRule.prototype, "actionType", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], TransferRule.prototype, "actionValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], TransferRule.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TransferRule.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TransferRule.prototype, "updatedAt", void 0);
exports.TransferRule = TransferRule = __decorate([
    (0, typeorm_1.Entity)('transfer_rules')
], TransferRule);
//# sourceMappingURL=transfer-rule.entity.js.map