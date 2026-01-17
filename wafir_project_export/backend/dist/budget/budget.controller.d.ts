import { BudgetService } from './budget.service';
import { CreateEnvelopeDto, UpdateEnvelopeDto } from './dto/envelope.dto';
import { CreateTransactionDto } from './dto/transaction.dto';
export declare class BudgetController {
    private readonly budgetService;
    constructor(budgetService: BudgetService);
    create(req: any, dto: CreateEnvelopeDto): Promise<import("./entities/envelope.entity").Envelope>;
    findAll(req: any): Promise<import("./entities/envelope.entity").Envelope[]>;
    findOne(req: any, id: string): Promise<import("./entities/envelope.entity").Envelope>;
    update(req: any, id: string, dto: UpdateEnvelopeDto): Promise<import("./entities/envelope.entity").Envelope>;
    remove(req: any, id: string): Promise<void>;
    createTransaction(req: any, dto: CreateTransactionDto): Promise<import("./entities/transaction.entity").Transaction>;
    findAllTransactions(req: any, id: string): Promise<import("./entities/transaction.entity").Transaction[]>;
    updateTransaction(req: any, id: string, dto: Partial<CreateTransactionDto>): Promise<import("./entities/transaction.entity").Transaction>;
    deleteTransaction(req: any, id: string): Promise<void>;
    findAllCategories(req: any): Promise<import("./entities/category.entity").Category[]>;
    createCategory(req: any, body: {
        name: string;
    }): Promise<import("./entities/category.entity").Category>;
}
