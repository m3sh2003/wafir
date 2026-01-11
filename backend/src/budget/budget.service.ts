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
        const envelopes = await this.envelopeRepository
            .createQueryBuilder('envelope')
            .leftJoin('envelope.transactions', 'transaction') // Assumes relationship exists
            .select([
                'envelope.id',
                'envelope.name',
                'envelope.limitAmount',
                'envelope.period',
                'envelope.userId'
            ])
            .addSelect('COALESCE(SUM(transaction.amount), 0)', 'spent')
            .where('envelope.userId = :userId', { userId })
            .groupBy('envelope.id')
            .getRawMany();

        // Map raw results back to expected shape if needed, mostly for camelCase
        return envelopes.map(e => ({
            id: e.envelope_id,
            name: e.envelope_name,
            limitAmount: Number(e.envelope_limitAmount),
            period: e.envelope_period,
            userId: e.envelope_userId,
            spent: Number(e.spent)
        })) as any;
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
        const envelope = await this.findOneEnvelope(dto.envelopeId, userId);
        const transaction = this.transactionRepository.create({
            ...dto,
            userId,
            envelope: await envelope,
            // default to Expense if not specified
            type: 'EXPENSE',
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
