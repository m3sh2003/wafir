import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { RulesService } from './rules.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('rules')
@UseGuards(JwtAuthGuard)
export class RulesController {
    constructor(private readonly rulesService: RulesService) { }

    @Get()
    findAll(@Request() req: any) {
        return this.rulesService.findAll(req.user.userId);
    }

    @Post()
    create(@Request() req: any, @Body() body: any) {
        return this.rulesService.create(req.user.userId, body);
    }
}
