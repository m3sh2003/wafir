import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { BudgetService } from '../budget/budget.service';
import { AssetsService } from '../assets/assets.service';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private apiKey: string;
    private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

    constructor(
        private configService: ConfigService,
        private usersService: UsersService,
        private budgetService: BudgetService,
        private assetsService: AssetsService,
    ) {
        const envKey = this.configService.get<string>('GEMINI_API_KEY');
        // Fallback to process.env for some cloud environments
        const processKey = process.env.GEMINI_API_KEY;
        this.apiKey = envKey || processKey || '';

        if (!this.apiKey) {
            this.logger.warn('GEMINI_API_KEY not found in environment');
        } else {
            this.logger.log(`AI Service ready. Using Key ending in ...${this.apiKey.slice(-4)}`);
        }
    }

    async chat(userId: number | string, message: string): Promise<string> {
        if (!this.apiKey) {
            return "Configuration Error: Missing API Key.";
        }

        try {
            const uidStr = userId.toString();
            // 1. Fetch User Data
            const [user, envelopes, transactions, accounts] = await Promise.all([
                this.usersService.findOneById(uidStr),
                this.budgetService.findAllEnvelopes(uidStr),
                this.budgetService.findAllTransactions(uidStr),
                this.assetsService.findAllAccounts(uidStr),
            ]);

            if (!user) {
                this.logger.error(`User not found for ID: ${userId}`);
                throw new Error('User not found');
            }

            // Calculate Totals
            const totalBudget = envelopes.reduce((sum, env) => sum + Number(env.limitAmount), 0);
            const totalSpent = envelopes.reduce((sum, env) => sum + Number((env as any).spent || 0), 0);
            const totalAssets = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
            const recentTransactions = transactions.slice(0, 5).map(t => `${t.type}: ${t.amount} (${t.description || 'No Desc'})`).join(', ');

            const financialContext = {
                name: user.name,
                riskProfile: user.riskProfile || 'Balanced',
                budget: {
                    totalAllocated: totalBudget,
                    totalSpent: totalSpent,
                    envelopes: envelopes.map(e => ({ name: e.name, limit: e.limitAmount, spent: (e as any).spent }))
                },
                assets: {
                    totalValue: totalAssets,
                    accounts: accounts.map(a => ({ name: a.name, type: a.type, balance: a.balance }))
                },
                recentActivity: recentTransactions
            };

            const systemPrompt = `
                You are Wafir AI, an expert Islamic Finance Advisor.
                
                **User Financial Data:**
                ${JSON.stringify(financialContext, null, 2)}
                
                **Instructions:**
                - Use the provided data to answer the user's question directly.
                - If the user asks for an assessment, analyze their budget utilization and asset allocation.
                - Keep answers concise (under 3 paragraphs).
                - Always ensure advice is Sharia-compliant.

                User Question: "${message}"
            `;

            // 2. Direct HTTP Call
            const url = `${this.baseUrl}?key=${this.apiKey}`;
            const payload = {
                contents: [{ parts: [{ text: systemPrompt }] }]
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`Gemini API Error: ${response.status} - ${errorText}`);
                if (response.status === 403) {
                    return "My system is currently offline due to a security update (403). Please check back later.";
                }
                return `I'm having trouble connecting (Error ${response.status}). Please try again.`;
            }

            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) return "I received an empty response.";
            return text;

        } catch (error) {
            this.logger.error('AI Service Exception:', error);
            return `Internal Error: ${error.message}`;
        }
    }
}
