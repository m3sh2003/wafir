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
        // --- DEBUG COMPONENT START ---
        if (message.trim().toLowerCase() === '/debug') {
            const envKey = this.configService.get<string>('GEMINI_API_KEY');
            const procKey = process.env.GEMINI_API_KEY;
            const finalKey = this.apiKey;

            return `
**Diagnostic Report:**
- **Status:** ${finalKey ? 'Ready' : 'MISSING KEY'}
- **Loaded Key Length:** ${finalKey ? finalKey.length : 0}
- **Ends With:** ${finalKey ? '...' + finalKey.slice(-4) : 'N/A'}
- **ConfigService Detection:** ${envKey ? 'Yes' : 'No'}
- **Process.env Detection:** ${procKey ? 'Yes' : 'No'}
- **User ID:** ${userId}
- **Available Env Keys:** ${Object.keys(process.env).join(', ')}
            `.trim();
        }
        // --- DEBUG COMPONENT END ---

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
                    accounts: accounts.map(a => {
                        const balance = Number(a.balance || 0);
                        const currency = (a as any).currency_code || 'SAR'; // Cast as any if DTO missing type

                        // Mock Rates (Sync with Frontend logic ideally)
                        let inSAR = balance;
                        if (currency === 'USD') inSAR = balance * 3.75;
                        if (currency === 'EGP') inSAR = balance * 0.08;

                        return {
                            name: a.name,
                            type: a.type,
                            isGoldLivePrice: (a as any).isGoldLivePrice,
                            originalBalance: `${balance} ${currency}`,
                            approxSAR: inSAR.toFixed(2)
                        };
                    })
                },
                recentActivity: recentTransactions
            };

            const systemPrompt = `
                You are Wafir AI, an expert Islamic Finance Advisor.
                
                **User Financial Data (Pre-Calculated in SAR):**
                ${JSON.stringify({
                ...financialContext,
                note: "All monetary values have been normalized to SAR (Saudi Riyal) for your convenience. Please use 'approxSAR' values for any aggregation."
            }, null, 2)}
                
                **Instructions:**
                - CRITICAL: You must use the 'approxSAR' field for any asset/net worth calculations. Do NOT sum 'originalBalance' values directly as they may contain mixed currencies (USD, EGP, etc.).
                - If the user asks for an assessment, analyze their budget utilization and asset allocation based on the SAR values.
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
