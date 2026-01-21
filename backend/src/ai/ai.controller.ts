import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

class ChatDto {
    message: string;
}

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @UseGuards(JwtAuthGuard)
    @Post('chat')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Chat with Wafir AI Advisor' })
    @ApiBody({ schema: { type: 'object', properties: { message: { type: 'string' } } } })
    async chat(@Request() req: any, @Body() body: ChatDto) {
        // req.user is populated by JwtStrategy
        const userId = req.user.userId;
        return {
            response: await this.aiService.chat(userId, body.message)
        };
    }
}
