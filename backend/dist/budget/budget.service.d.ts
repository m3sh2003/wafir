import { Repository } from 'typeorm';
import { Envelope } from './entities/envelope.entity';
import { Transaction } from './entities/transaction.entity';
import { CreateEnvelopeDto, UpdateEnvelopeDto } from './dto/envelope.dto';
import { CreateTransactionDto } from './dto/transaction.dto';
import { Category } from './entities/category.entity';
export declare class BudgetService {
    private envelopeRepository;
    private transactionRepository;
    private categoryRepository;
    constructor(envelopeRepository: Repository<Envelope>, transactionRepository: Repository<Transaction>, categoryRepository: Repository<Category>);
    createEnvelope(userId: string, dto: CreateEnvelopeDto): Promise<Envelope>;
    findAllEnvelopes(userId: string): Promise<Envelope[]>;
    findOneEnvelope(id: string, userId: string): Promise<Envelope>;
    updateEnvelope(id: string, userId: string, dto: UpdateEnvelopeDto): Promise<Envelope>;
    removeEnvelope(id: string, userId: string): Promise<void>;
    createTransaction(userId: string, dto: CreateTransactionDto): Promise<Transaction>;
    findAllTransactionsForEnvelope(userId: string, envelopeId: string): Promise<Transaction[]>;
    findAllTransactions(userId: string): Promise<Transaction[]>;
    findAllCategories(userId: string): Promise<Category[]>;
    createCategory(userId: string, name: string): Promise<Category>;
    updateTransaction(id: string, userId: string, dto: Partial<CreateTransactionDto>): Promise<Transaction>;
    removeTransaction(id: string, userId: string): Promise<void>;
}
