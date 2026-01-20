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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const envelope_entity_1 = require("../budget/entities/envelope.entity");
const initial_data_1 = require("../config/initial-data");
let UsersService = class UsersService {
    usersRepository;
    envelopeRepository;
    constructor(usersRepository, envelopeRepository) {
        this.usersRepository = usersRepository;
        this.envelopeRepository = envelopeRepository;
    }
    async findOneByEmail(email) {
        return this.usersRepository.findOneBy({ email });
    }
    async findOneById(id) {
        return this.usersRepository.findOneBy({ id });
    }
    async create(userData) {
        const user = this.usersRepository.create(userData);
        const savedUser = await this.usersRepository.save(user);
        try {
            await this.initializeUserEnvelopes(savedUser.id);
        }
        catch (error) {
            console.error('Failed to initialize envelopes for user', savedUser.id, error);
        }
        return savedUser;
    }
    async initializeUserEnvelopes(userId) {
        try {
            for (const cat of initial_data_1.arabicCategories) {
                const envelope = this.envelopeRepository.create({
                    name: cat.name,
                    limitAmount: 0,
                    period: 'Monthly',
                    userId: userId
                });
                await this.envelopeRepository.save(envelope);
            }
        }
        catch (e) {
            console.error('Error in initializeUserEnvelopes:', e);
        }
    }
    async updateOnboarding(userId, dto) {
        const user = await this.findOneById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        user.riskProfile = dto.riskProfile;
        user.settings = { ...user.settings, monthlyIncome: dto.monthlyIncome };
        await this.usersRepository.save(user);
        if (dto.budgetLimits) {
            for (const [name, limit] of Object.entries(dto.budgetLimits)) {
                await this.envelopeRepository.update({ userId, name }, { limitAmount: limit });
            }
        }
        return user;
    }
    async updateSettings(userId, dto) {
        console.log('UpdateSettings (Raw SQL) Called for:', userId, 'DTO:', dto);
        await this.usersRepository.query(`UPDATE users SET settings = COALESCE(settings, '{}'::jsonb) || $1 WHERE id = $2`, [JSON.stringify(dto), userId]);
        const user = await this.findOneById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateCurrency(userId, currency) {
        await this.usersRepository.query(`UPDATE users SET settings = jsonb_set(COALESCE(settings, '{}'::jsonb), '{currency}', $1::jsonb) WHERE id = $2`, [`"${currency}"`, userId]);
        const user = await this.findOneById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateProfile(userId, dto) {
        const user = await this.findOneById(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (dto.name !== undefined)
            user.name = dto.name;
        if (dto.email !== undefined)
            user.email = dto.email;
        const currentSettings = user.settings || {};
        user.settings = {
            ...currentSettings,
            profile: {
                ...(currentSettings['profile'] || {}),
                ...(dto.phone ? { phone: dto.phone } : {}),
                ...(dto.age ? { age: dto.age } : {}),
            }
        };
        await this.usersRepository.save(user);
        return user;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(envelope_entity_1.Envelope)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map