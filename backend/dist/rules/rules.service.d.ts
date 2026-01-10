import { Repository } from 'typeorm';
import { TransferRule } from './entities/transfer-rule.entity';
export declare class RulesService {
    private rulesRepository;
    constructor(rulesRepository: Repository<TransferRule>);
    findAll(userId: string): Promise<TransferRule[]>;
    create(userId: string, rule: Partial<TransferRule>): Promise<TransferRule>;
    categorizeTransaction(userId: string, description: string, amount: number): Promise<string | null>;
}
