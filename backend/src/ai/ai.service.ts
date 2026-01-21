import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private apiKey: string;
    private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

    constructor(
        private configService: ConfigService,
        private usersService: UsersService,
    ) {
        const envKey = this.configService.get<string>('GEMINI_API_KEY');
        this.apiKey = envKey || '';

        if (!this.apiKey) {
            this.logger.warn('GEMINI_API_KEY not found');
        } else {
            this.logger.log(`AI Service ready. Using Key ending in ...${this.apiKey.slice(-4)}`);
        }
    }

    async chat(userId: number | string, message: string): Promise<string> {
        if (!this.apiKey) {
            return "Configuration Error: Missing API Key.";
        }

        try {
            // 1. Fetch User Context
            const user = await this.usersService.findOneById(userId.toString());

            if (!user) {
                this.logger.error(`User not found for ID: ${userId}`);
                throw new Error('User not found');
            }

            const context = {
                name: user.name,
                riskProfile: user.riskProfile || 'Balanced',
            };

            const systemPrompt = `
                You are Wafir AI, an Islamic Finance Advisor.
                User Context: ${JSON.stringify(context)}.
                Question: "${message}"
                Answer concisely and helpfully.
            `;

            // 2. Direct HTTP Call (Bypassing SDK to avoid 403)
            const url = `${this.baseUrl}?key=${this.apiKey}`;
            const payload = {
                contents: [{ parts: [{ text: systemPrompt }] }]
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`Gemini API Error: ${response.status} - ${errorText}`);
                return `I'm having trouble connecting (Error ${response.status}). Please try again.`;
            }

            const data = await response.json();
            // console.log('Gemini Response:', JSON.stringify(data, null, 2));

            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                return "I received an empty response from my knowledge base.";
            }

            return text;

        } catch (error) {
            this.logger.error('AI Service Exception:', error);
            return `Internal Error: ${error.message}`;
        }
    }
}
