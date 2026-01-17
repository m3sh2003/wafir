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
exports.AssetsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const assets_service_1 = require("./assets.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let AssetsController = class AssetsController {
    assetsService;
    constructor(assetsService) {
        this.assetsService = assetsService;
    }
    getAccounts(req) {
        return this.assetsService.findAllAccounts(req.user.userId);
    }
    createAccount(req, body) {
        return this.assetsService.createAccount(req.user.userId, body);
    }
    getHoldings(req) {
        return this.assetsService.findAllHoldings(req.user.userId);
    }
    addHolding(accountId, body) {
        return this.assetsService.createHolding(accountId, body);
    }
    updateAccount(req, id, body) {
        return this.assetsService.updateAccount(id, req.user.userId, body);
    }
    deleteAccount(req, id) {
        return this.assetsService.removeAccount(id, req.user.userId);
    }
    deleteHolding(req, id) {
        return this.assetsService.removeHolding(id, req.user.userId);
    }
};
exports.AssetsController = AssetsController;
__decorate([
    (0, common_1.Get)('accounts'),
    (0, swagger_1.ApiOperation)({ summary: 'List all accounts' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "getAccounts", null);
__decorate([
    (0, common_1.Post)('accounts'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new account' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "createAccount", null);
__decorate([
    (0, common_1.Get)('holdings'),
    (0, swagger_1.ApiOperation)({ summary: 'List all holdings' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "getHoldings", null);
__decorate([
    (0, common_1.Post)('accounts/:id/holdings'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a holding to an account' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "addHolding", null);
__decorate([
    (0, common_1.Patch)('accounts/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an account' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "updateAccount", null);
__decorate([
    (0, common_1.Delete)('accounts/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an account' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "deleteAccount", null);
__decorate([
    (0, common_1.Delete)('holdings/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a holding' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AssetsController.prototype, "deleteHolding", null);
exports.AssetsController = AssetsController = __decorate([
    (0, swagger_1.ApiTags)('Assets'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('assets'),
    __metadata("design:paramtypes", [assets_service_1.AssetsService])
], AssetsController);
//# sourceMappingURL=assets.controller.js.map