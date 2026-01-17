import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Envelope } from '../budget/entities/envelope.entity';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';

import { arabicCategories } from '../config/initial-data';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Envelope)
        private envelopeRepository: Repository<Envelope>,
    ) { }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOneBy({ email });
    }

    async findOneById(id: string): Promise<User | null> {
        return this.usersRepository.findOneBy({ id });
    }

    async create(userData: Partial<User>): Promise<User> {
        const user = this.usersRepository.create(userData);
        const savedUser = await this.usersRepository.save(user); // Save User first

        try {
            await this.initializeUserEnvelopes(savedUser.id);
        } catch (error) {
            console.error('Failed to initialize envelopes for user', savedUser.id, error);
            // Optionally handle cleanup or ignore if minor
        }

        return savedUser;
    }

    private async initializeUserEnvelopes(userId: string) {
        try {
            for (const cat of arabicCategories) {
                const envelope = this.envelopeRepository.create({
                    name: cat.name,
                    limitAmount: 0, // Zero limits as requested
                    period: 'Monthly',
                    userId: userId
                });
                await this.envelopeRepository.save(envelope);
            }
        } catch (e) {
            console.error('Error in initializeUserEnvelopes:', e);
        }
    }

    async updateOnboarding(userId: string, dto: UpdateOnboardingDto): Promise<User> {
        const user = await this.findOneById(userId);
        if (!user) throw new NotFoundException('User not found');

        // Update User Profile
        user.riskProfile = dto.riskProfile;
        user.settings = { ...user.settings, monthlyIncome: dto.monthlyIncome };
        await this.usersRepository.save(user);

        // Update Budgets
        if (dto.budgetLimits) {
            for (const [name, limit] of Object.entries(dto.budgetLimits)) {
                await this.envelopeRepository.update(
                    { userId, name }, // Find by composite key (user + name)
                    { limitAmount: limit }
                );
            }
        }

        return user;
    }
    async updateSettings(userId: string, dto: any): Promise<User> {
        console.log('UpdateSettings (Raw SQL) Called for:', userId, 'DTO:', dto);

        // Force update using Raw SQL to ensure JSONB merge works correctly
        await this.usersRepository.query(
            `UPDATE users SET settings = COALESCE(settings, '{}'::jsonb) || $1 WHERE id = $2`,
            [JSON.stringify(dto), userId]
        );

        const user = await this.findOneById(userId);
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async updateCurrency(userId: string, currency: string): Promise<User> {
        // Specific optimized update for currency to ensure it sticks
        await this.usersRepository.query(
            `UPDATE users SET settings = jsonb_set(COALESCE(settings, '{}'::jsonb), '{currency}', $1::jsonb) WHERE id = $2`,
            [`"${currency}"`, userId]
        );
        const user = await this.findOneById(userId);
        if (!user) throw new NotFoundException('User not found');
        return user;
    }
}
