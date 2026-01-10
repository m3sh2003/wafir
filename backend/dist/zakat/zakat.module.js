"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZakatModule = void 0;
const common_1 = require("@nestjs/common");
const zakat_controller_1 = require("./zakat.controller");
const zakat_service_1 = require("./zakat.service");
const assets_module_1 = require("../assets/assets.module");
let ZakatModule = class ZakatModule {
};
exports.ZakatModule = ZakatModule;
exports.ZakatModule = ZakatModule = __decorate([
    (0, common_1.Module)({
        imports: [assets_module_1.AssetsModule],
        controllers: [zakat_controller_1.ZakatController],
        providers: [zakat_service_1.ZakatService],
    })
], ZakatModule);
//# sourceMappingURL=zakat.module.js.map