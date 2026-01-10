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
exports.ZakatRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ZakatRequestDto {
    portfolio_valuation_usd;
    non_zakat_assets;
    nisab_usd;
}
exports.ZakatRequestDto = ZakatRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10000 }),
    __metadata("design:type", Number)
], ZakatRequestDto.prototype, "portfolio_valuation_usd", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Car', 'House'] }),
    __metadata("design:type", Array)
], ZakatRequestDto.prototype, "non_zakat_assets", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 6000 }),
    __metadata("design:type", Number)
], ZakatRequestDto.prototype, "nisab_usd", void 0);
//# sourceMappingURL=zakat-request.dto.js.map