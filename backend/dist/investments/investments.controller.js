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
exports.InvestmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const investments_service_1 = require("./investments.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let InvestmentsController = class InvestmentsController {
    investmentsService;
    constructor(investmentsService) {
        this.investmentsService = investmentsService;
    }
    findAllProducts() {
        return this.investmentsService.findAllProducts();
    }
    getPortfolio(req) {
        return this.investmentsService.getPortfolio(req.user.userId);
    }
    invest(req, body) {
        return this.investmentsService.invest(req.user.userId, body.productId, body.amount);
    }
    sell(req, body) {
        return this.investmentsService.sellInvestment(req.user.userId, body.productId, body.amount);
    }
    async getRiskProfile(req) {
        return this.investmentsService.getRiskProfile(req.user.userId);
    }
    setRiskProfile(req, body) {
        return this.investmentsService.setRiskProfile(req.user.userId, body.score);
    }
    rebalance(req) {
        return this.investmentsService.rebalancePortfolio(req.user.userId);
    }
};
exports.InvestmentsController = InvestmentsController;
__decorate([
    (0, common_1.Get)('products'),
    (0, swagger_1.ApiOperation)({ summary: 'List all investment products' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InvestmentsController.prototype, "findAllProducts", null);
__decorate([
    (0, common_1.Get)('portfolio'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user portfolio' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InvestmentsController.prototype, "getPortfolio", null);
__decorate([
    (0, common_1.Post)('invest'),
    (0, swagger_1.ApiOperation)({ summary: 'Invest in a product' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], InvestmentsController.prototype, "invest", null);
__decorate([
    (0, common_1.Post)('sell'),
    (0, swagger_1.ApiOperation)({ summary: 'Sell an investment' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], InvestmentsController.prototype, "sell", null);
__decorate([
    (0, common_1.Get)('risk-profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user risk profile' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "getRiskProfile", null);
__decorate([
    (0, common_1.Post)('risk-profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate and set risk profile' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], InvestmentsController.prototype, "setRiskProfile", null);
__decorate([
    (0, common_1.Post)('portfolio/rebalance'),
    (0, swagger_1.ApiOperation)({ summary: 'Rebalance portfolio according to Sharia/Risk constraints' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InvestmentsController.prototype, "rebalance", null);
exports.InvestmentsController = InvestmentsController = __decorate([
    (0, swagger_1.ApiTags)('Investments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('investments'),
    __metadata("design:paramtypes", [investments_service_1.InvestmentsService])
], InvestmentsController);
//# sourceMappingURL=investments.controller.js.map