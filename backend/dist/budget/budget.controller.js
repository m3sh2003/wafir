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
exports.BudgetController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const budget_service_1 = require("./budget.service");
const envelope_dto_1 = require("./dto/envelope.dto");
const transaction_dto_1 = require("./dto/transaction.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let BudgetController = class BudgetController {
    budgetService;
    constructor(budgetService) {
        this.budgetService = budgetService;
    }
    create(req, dto) {
        return this.budgetService.createEnvelope(req.user.userId, dto);
    }
    findAll(req) {
        return this.budgetService.findAllEnvelopes(req.user.userId);
    }
    findOne(req, id) {
        return this.budgetService.findOneEnvelope(id, req.user.userId);
    }
    update(req, id, dto) {
        return this.budgetService.updateEnvelope(id, req.user.userId, dto);
    }
    remove(req, id) {
        return this.budgetService.removeEnvelope(id, req.user.userId);
    }
    createTransaction(req, dto) {
        return this.budgetService.createTransaction(req.user.userId, dto);
    }
    findAllGlobalTransactions(req) {
        return this.budgetService.findAllTransactions(req.user.userId);
    }
    findAllTransactions(req, id) {
        return this.budgetService.findAllTransactionsForEnvelope(req.user.userId, id);
    }
    updateTransaction(req, id, dto) {
        return this.budgetService.updateTransaction(id, req.user.userId, dto);
    }
    deleteTransaction(req, id) {
        return this.budgetService.removeTransaction(id, req.user.userId);
    }
    findAllCategories(req) {
        return this.budgetService.findAllCategories(req.user.userId);
    }
    createCategory(req, body) {
        return this.budgetService.createCategory(req.user.userId, body.name);
    }
};
exports.BudgetController = BudgetController;
__decorate([
    (0, common_1.Post)('envelopes'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new budget envelope' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, envelope_dto_1.CreateEnvelopeDto]),
    __metadata("design:returntype", void 0)
], BudgetController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('envelopes'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all envelopes for user' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BudgetController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('envelopes/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BudgetController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('envelopes/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, envelope_dto_1.UpdateEnvelopeDto]),
    __metadata("design:returntype", void 0)
], BudgetController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('envelopes/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BudgetController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new transaction' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, transaction_dto_1.CreateTransactionDto]),
    __metadata("design:returntype", void 0)
], BudgetController.prototype, "createTransaction", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all transactions' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BudgetController.prototype, "findAllGlobalTransactions", null);
__decorate([
    (0, common_1.Get)('envelopes/:id/transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transactions for an envelope' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BudgetController.prototype, "findAllTransactions", null);
__decorate([
    (0, common_1.Patch)('transactions/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a transaction' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], BudgetController.prototype, "updateTransaction", null);
__decorate([
    (0, common_1.Delete)('transactions/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a transaction' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BudgetController.prototype, "deleteTransaction", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'List categories' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BudgetController.prototype, "findAllCategories", null);
__decorate([
    (0, common_1.Post)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Create category' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], BudgetController.prototype, "createCategory", null);
exports.BudgetController = BudgetController = __decorate([
    (0, swagger_1.ApiTags)('Budget'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('budget'),
    __metadata("design:paramtypes", [budget_service_1.BudgetService])
], BudgetController);
//# sourceMappingURL=budget.controller.js.map