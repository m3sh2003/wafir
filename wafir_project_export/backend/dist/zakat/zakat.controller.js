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
exports.ZakatController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const zakat_service_1 = require("./zakat.service");
const zakat_request_dto_1 = require("./dto/zakat-request.dto");
let ZakatController = class ZakatController {
    zakatService;
    constructor(zakatService) {
        this.zakatService = zakatService;
    }
    calculate(body) {
        return this.zakatService.calculate(body);
    }
    calculateSystem(req) {
        return this.zakatService.calculateFromSystem(req.user.userId);
    }
};
exports.ZakatController = ZakatController;
__decorate([
    (0, common_1.Post)('calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate Zakat for assets (Manual Input)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [zakat_request_dto_1.ZakatRequestDto]),
    __metadata("design:returntype", void 0)
], ZakatController.prototype, "calculate", null);
__decorate([
    (0, common_1.Get)('calculate/system'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate Zakat from System Assets' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ZakatController.prototype, "calculateSystem", null);
exports.ZakatController = ZakatController = __decorate([
    (0, swagger_1.ApiTags)('Zakat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('zakat'),
    __metadata("design:paramtypes", [zakat_service_1.ZakatService])
], ZakatController);
//# sourceMappingURL=zakat.controller.js.map