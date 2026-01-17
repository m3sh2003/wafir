import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransferRule } from './entities/transfer-rule.entity';

@Injectable()
export class RulesService {
    constructor(
        @InjectRepository(TransferRule)
        private rulesRepository: Repository<TransferRule>,
    ) { }

    async findAll(userId: string): Promise<TransferRule[]> {
        return this.rulesRepository.find({ where: { userId } });
    }

    async create(userId: string, rule: Partial<TransferRule>) {
        const newRule = this.rulesRepository.create({ ...rule, userId });
        return this.rulesRepository.save(newRule);
    }

    async categorizeTransaction(userId: string, description: string, amount: number): Promise<string | null> {
        const rules = await this.rulesRepository.find({
            where: { userId, actionType: 'CATEGORIZE' as any, isActive: true }
        });

        for (const rule of rules) {
            // Check condition. Assuming simple 'contains' logic for now from conditionValue
            const condition = rule.conditionValue; // e.g. { contains: 'Uber' }

            if (condition && condition.contains) {
                if (description.toLowerCase().includes(condition.contains.toLowerCase())) {
                    return rule.actionValue.category; // e.g. { category: 'Transport' }
                }
            }
        }
        return null;
    }
}
