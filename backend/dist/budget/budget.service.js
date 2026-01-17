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
exports.BudgetService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const envelope_entity_1 = require("./entities/envelope.entity");
const transaction_entity_1 = require("./entities/transaction.entity");
const category_entity_1 = require("./entities/category.entity");
let BudgetService = class BudgetService {
    envelopeRepository;
    transactionRepository;
    categoryRepository;
    constructor(envelopeRepository, transactionRepository, categoryRepository) {
        this.envelopeRepository = envelopeRepository;
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }
    async createEnvelope(userId, dto) {
        const envelope = this.envelopeRepository.create({
            ...dto,
            userId,
        });
        return this.envelopeRepository.save(envelope);
    }
    async findAllEnvelopes(userId) {
        console.log('Fetching envelopes for userId:', userId);
        try {
            const envelopes = await this.envelopeRepository
                .createQueryBuilder('envelope')
                .leftJoin('envelope.transactions', 'transaction')
                .select('envelope.id', 'id')
                .addSelect('envelope.name', 'name')
                .addSelect('envelope.limitAmount', 'limitAmount')
                .addSelect('envelope.period', 'period')
                .addSelect('envelope.userId', 'userId')
                .addSelect('COALESCE(SUM(transaction.amount), 0)', 'spent')
                .where('envelope.userId = :userId', { userId })
                .groupBy('envelope.id')
                .addGroupBy('envelope.name')
                .addGroupBy('envelope.limitAmount')
                .addGroupBy('envelope.period')
                .addGroupBy('envelope.userId')
                .getRawMany();
            console.log('Raw envelopes data:', envelopes);
            return envelopes.map(e => ({
                id: e.id,
                name: e.name,
                limitAmount: Number(e.limitAmount),
                period: e.period,
                userId: e.userId,
                spent: Number(e.spent || 0)
            }));
        }
        catch (error) {
            console.error('Error fetching envelopes:', error);
            console.error('Error stack:', error.stack);
            throw error;
        }
    }
    async findOneEnvelope(id, userId) {
        const envelope = await this.envelopeRepository.findOne({ where: { id, userId } });
        if (!envelope)
            throw new common_1.NotFoundException('Envelope not found');
        return envelope;
    }
    async updateEnvelope(id, userId, dto) {
        const envelope = await this.findOneEnvelope(id, userId);
        Object.assign(envelope, dto);
        return this.envelopeRepository.save(envelope);
    }
    async removeEnvelope(id, userId) {
        const envelope = await this.findOneEnvelope(id, userId);
        await this.envelopeRepository.remove(envelope);
    }
    async createTransaction(userId, dto) {
        let envelope;
        if (dto.envelopeId) {
            envelope = await this.findOneEnvelope(dto.envelopeId, userId);
        }
        else if (dto.type !== 'INCOME') {
            throw new common_1.NotFoundException('Envelope ID is required for expenses');
        }
        const transaction = this.transactionRepository.create({
            ...dto,
            userId,
            envelope: envelope,
            type: dto.type || 'EXPENSE',
            currency: 'SAR',
            date: dto.date ? new Date(dto.date) : new Date(),
        });
        return this.transactionRepository.save(transaction);
    }
    async findAllTransactionsForEnvelope(userId, envelopeId) {
        await this.findOneEnvelope(envelopeId, userId);
        return this.transactionRepository.find({
            where: { envelopeId, userId },
            order: { date: 'DESC' }
        });
    }
    async findAllTransactions(userId) {
        return this.transactionRepository.find({
            where: { userId },
            order: { date: 'DESC' },
            relations: ['envelope']
        });
    }
    async findAllCategories(userId) {
        return this.categoryRepository.find({
            where: [
                { userId: (0, typeorm_2.IsNull)() },
                { userId }
            ]
        });
    }
    async createCategory(userId, name) {
        const category = this.categoryRepository.create({
            name,
            userId,
            type: 'EXPENSE'
        });
        return this.categoryRepository.save(category);
    }
    async updateTransaction(id, userId, dto) {
        const transaction = await this.transactionRepository.findOne({ where: { id, userId } });
        if (!transaction)
            throw new common_1.NotFoundException('Transaction not found');
        Object.assign(transaction, dto);
        if (dto.date)
            transaction.date = new Date(dto.date);
        return this.transactionRepository.save(transaction);
    }
    async removeTransaction(id, userId) {
        const transaction = await this.transactionRepository.findOne({ where: { id, userId } });
        if (!transaction)
            throw new common_1.NotFoundException('Transaction not found');
        await this.transactionRepository.remove(transaction);
    }
};
exports.BudgetService = BudgetService;
exports.BudgetService = BudgetService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(envelope_entity_1.Envelope)),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(2, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BudgetService);
//# sourceMappingURL=budget.service.js.map