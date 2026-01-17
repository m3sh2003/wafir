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
exports.UpdateOnboardingDto = exports.RiskProfile = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var RiskProfile;
(function (RiskProfile) {
    RiskProfile["CONSERVATIVE"] = "Conservative";
    RiskProfile["BALANCED"] = "Balanced";
    RiskProfile["AGGRESSIVE"] = "Aggressive";
})(RiskProfile || (exports.RiskProfile = RiskProfile = {}));
class UpdateOnboardingDto {
    riskProfile;
    monthlyIncome;
    budgetLimits;
}
exports.UpdateOnboardingDto = UpdateOnboardingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: RiskProfile, example: 'Balanced' }),
    (0, class_validator_1.IsEnum)(RiskProfile),
    __metadata("design:type", String)
], UpdateOnboardingDto.prototype, "riskProfile", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5000, description: 'Monthly income in base currency' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateOnboardingDto.prototype, "monthlyIncome", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { 'Groceries': 1500, 'Transport': 300 },
        description: 'Key-value pair of Category Name -> Limit Amount'
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateOnboardingDto.prototype, "budgetLimits", void 0);
//# sourceMappingURL=update-onboarding.dto.js.map