import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { UsersService } from '../users/users.service';

@Injectable()
export class AiService {
    private genAI: GoogleGenerativeAI;
    private model: any;
    private readonly logger = new Logger(AiService.name);

    constructor(
        private configService: ConfigService,
        private usersService: UsersService,
    ) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        } else {
            this.logger.warn('GEMINI_API_KEY not found in environment variables');
        }
    }

    async chat(userId: number, message: string): Promise<string> {
        if (!this.model) {
            return "I'm sorry, I am not fully configured yet (Missing API Key). Please ask the administrator to check the server configuration.";
        }

        try {
            // 1. Fetch User Context
            const user = await this.usersService.findOne(userId);
            // Simplify context for the prompt
            const context = {
                name: user.name,
                profile: user.profile, // Contains Risk Profile, Age, etc.
                // In a real scenario, we'd inject InvestmentsService and BudgetService here to get live data
                // For now, we'll assume the profile contains the summary info if available, or we advise generic
                // but tailored to their risk profile.
            };

            // 2. Construct System Prompt
            const systemPrompt = `
        You are Wafir AI, an expert Islamic Finance Advisor.
        User Context: ${JSON.stringify(context)}.
        
        Your Goal: Help the user grow their wealth using Halal investment strategies and sound budgeting.
        
        Rules:
        - Only provide Halal (Sharia-compliant) advice.
        - Be concise, friendly, and professional.
        - Use the user's risk profile from the context to tailor advice (e.g. "Balanced", "Conservative").
        - If the user asks about their specific portfolio numbers and you don't have them, explain that you are using their profile settings.
        
        User Question: "${message}"
      `;

            // 3. Generate Content
            const result = await this.model.generateContent(systemPrompt);
            const response = await result.response;
            let text = response.text();

            return text;

        } catch (error) {
            this.logger.error('Error generating AI response', error);
            return "I'm having trouble connecting to my knowledge base right now. Please try again later.";
        }
    }
}
