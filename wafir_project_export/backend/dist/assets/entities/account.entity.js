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
exports.Account = exports.AccountType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const holding_entity_1 = require("./holding.entity");
var AccountType;
(function (AccountType) {
    AccountType["BANK"] = "bank";
    AccountType["BROKER"] = "broker";
    AccountType["CASH"] = "cash";
    AccountType["CERTIFICATE"] = "certificate";
    AccountType["REAL_ESTATE"] = "real_estate";
})(AccountType || (exports.AccountType = AccountType = {}));
let Account = class Account {
    id;
    name;
    currencyCode;
    balance;
    type;
    isPrimary;
    user;
    userId;
    holdings;
};
exports.Account = Account;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Account.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Account.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3, name: 'currency_code' }),
    __metadata("design:type", String)
], Account.prototype, "currencyCode", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Account.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AccountType,
        default: AccountType.BANK
    }),
    __metadata("design:type", String)
], Account.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_primary', default: false }),
    __metadata("design:type", Boolean)
], Account.prototype, "isPrimary", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Account.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], Account.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => holding_entity_1.Holding, holding => holding.account),
    __metadata("design:type", Array)
], Account.prototype, "holdings", void 0);
exports.Account = Account = __decorate([
    (0, typeorm_1.Entity)('accounts')
], Account);
//# sourceMappingURL=account.entity.js.map