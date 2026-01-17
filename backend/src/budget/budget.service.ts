import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Envelope } from './entities/envelope.entity';
import { Transaction } from './entities/transaction.entity';
import { CreateEnvelopeDto, UpdateEnvelopeDto } from './dto/envelope.dto';
import { CreateTransactionDto } from './dto/transaction.dto';
import { Category } from './entities/category.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BudgetService {
    constructor(
        @InjectRepository(Envelope)
        private envelopeRepository: Repository<Envelope>,
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>,
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) { }

    async createEnvelope(userId: string, dto: CreateEnvelopeDto): Promise<Envelope> {
        const envelope = this.envelopeRepository.create({
            ...dto,
            userId,
        });
        return this.envelopeRepository.save(envelope);
    }

    async findAllEnvelopes(userId: string): Promise<Envelope[]> {
        console.log('Fetching envelopes for userId:', userId);
        try {
            const envelopes = await this.envelopeRepository
                .createQueryBuilder('envelope')
                .leftJoin('envelope.transactions', 'transaction') // Assumes relationship exists
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
            })) as any;
        } catch (error) {
            console.error('Error fetching envelopes:', error);
            console.error('Error stack:', error.stack);
            throw error;
        }
    }

    async findOneEnvelope(id: string, userId: string): Promise<Envelope> {
        const envelope = await this.envelopeRepository.findOne({ where: { id, userId } });
        if (!envelope) throw new NotFoundException('Envelope not found');
        return envelope;
    }

    async updateEnvelope(id: string, userId: string, dto: UpdateEnvelopeDto): Promise<Envelope> {
        const envelope = await this.findOneEnvelope(id, userId);
        Object.assign(envelope, dto);
        return this.envelopeRepository.save(envelope);
    }

    async removeEnvelope(id: string, userId: string): Promise<void> {
        const envelope = await this.findOneEnvelope(id, userId);
        await this.envelopeRepository.remove(envelope);
    }

    async createTransaction(userId: string, dto: CreateTransactionDto): Promise<Transaction> {
        let envelope;
        if (dto.envelopeId) {
            envelope = await this.findOneEnvelope(dto.envelopeId, userId);
        } else if (dto.type !== 'INCOME') {
            throw new NotFoundException('Envelope ID is required for expenses');
        }

        const transaction = this.transactionRepository.create({
            ...dto,
            userId,
            envelope: envelope,
            // default to Expense if not specified
            type: dto.type || 'EXPENSE',
            currency: 'SAR',
            date: dto.date ? new Date(dto.date) : new Date(),
        });
        return this.transactionRepository.save(transaction);
    }

    async findAllTransactionsForEnvelope(userId: string, envelopeId: string): Promise<Transaction[]> {
        // Ensure user owns the envelope
        await this.findOneEnvelope(envelopeId, userId);
        return this.transactionRepository.find({
            where: { envelopeId, userId },
            order: { date: 'DESC' }
        });
    }

    async findAllTransactions(userId: string): Promise<Transaction[]> {
        return this.transactionRepository.find({
            where: { userId },
            order: { date: 'DESC' },
            relations: ['envelope']
        });
    }

    async findAllCategories(userId: string): Promise<Category[]> {
        return this.categoryRepository.find({
            where: [
                { userId: IsNull() }, // System defaults
                { userId }       // User custom
            ]
        });
    }

    async createCategory(userId: string, name: string): Promise<Category> {
        const category = this.categoryRepository.create({
            name,
            userId,
            type: 'EXPENSE'
        });
        return this.categoryRepository.save(category);
    }
    async updateTransaction(id: string, userId: string, dto: Partial<CreateTransactionDto>): Promise<Transaction> {
        const transaction = await this.transactionRepository.findOne({ where: { id, userId } });
        if (!transaction) throw new NotFoundException('Transaction not found');
        Object.assign(transaction, dto);
        if (dto.date) transaction.date = new Date(dto.date);
        return this.transactionRepository.save(transaction);
    }

    async removeTransaction(id: string, userId: string): Promise<void> {
        const transaction = await this.transactionRepository.findOne({ where: { id, userId } });
        if (!transaction) throw new NotFoundException('Transaction not found');
        await this.transactionRepository.remove(transaction);
    }
}
