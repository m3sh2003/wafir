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
exports.UpdateEnvelopeDto = exports.CreateEnvelopeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateEnvelopeDto {
    name;
    limitAmount;
    period;
}
exports.CreateEnvelopeDto = CreateEnvelopeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Groceries' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEnvelopeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1500.00 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateEnvelopeDto.prototype, "limitAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Monthly', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEnvelopeDto.prototype, "period", void 0);
class UpdateEnvelopeDto {
    name;
    limitAmount;
}
exports.UpdateEnvelopeDto = UpdateEnvelopeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEnvelopeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateEnvelopeDto.prototype, "limitAmount", void 0);
//# sourceMappingURL=envelope.dto.js.map