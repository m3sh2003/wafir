import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BudgetService } from './budget.service';
import { CreateEnvelopeDto, UpdateEnvelopeDto } from './dto/envelope.dto';
import { CreateTransactionDto } from './dto/transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Budget')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('budget')
export class BudgetController {
    constructor(private readonly budgetService: BudgetService) { }

    @Post('envelopes')
    @ApiOperation({ summary: 'Create a new budget envelope' })
    create(@Request() req: any, @Body() dto: CreateEnvelopeDto) {
        return this.budgetService.createEnvelope(req.user.userId, dto);
    }

    @Get('envelopes')
    @ApiOperation({ summary: 'Get all envelopes for user' })
    findAll(@Request() req: any) {
        return this.budgetService.findAllEnvelopes(req.user.userId);
    }

    @Get('envelopes/:id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.budgetService.findOneEnvelope(id, req.user.userId);
    }

    @Patch('envelopes/:id')
    update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateEnvelopeDto) {
        return this.budgetService.updateEnvelope(id, req.user.userId, dto);
    }

    @Delete('envelopes/:id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.budgetService.removeEnvelope(id, req.user.userId);
    }

    @Post('transactions')
    @ApiOperation({ summary: 'Create a new transaction' })
    createTransaction(@Request() req: any, @Body() dto: CreateTransactionDto) {
        return this.budgetService.createTransaction(req.user.userId, dto);
    }

    @Get('envelopes/:id/transactions')
    @ApiOperation({ summary: 'Get transactions for an envelope' })
    findAllTransactions(@Request() req: any, @Param('id') id: string) {
        return this.budgetService.findAllTransactionsForEnvelope(req.user.userId, id);
    }

    @Get('categories')
    @ApiOperation({ summary: 'List categories' })
    findAllCategories(@Request() req: any) {
        return this.budgetService.findAllCategories(req.user.userId);
    }

    @Post('categories')
    @ApiOperation({ summary: 'Create category' })
    createCategory(@Request() req: any, @Body() body: { name: string }) {
        return this.budgetService.createCategory(req.user.userId, body.name);
    }
}
