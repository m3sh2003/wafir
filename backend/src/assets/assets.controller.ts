import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Get('accounts')
    @ApiOperation({ summary: 'List all accounts' })
    getAccounts(@Request() req: any) {
        return this.assetsService.findAllAccounts(req.user.userId);
    }

    @Post('accounts')
    @ApiOperation({ summary: 'Create a new account' })
    createAccount(@Request() req: any, @Body() body: any) {
        return this.assetsService.createAccount(req.user.userId, body);
    }

    @Get('holdings')
    @ApiOperation({ summary: 'List all holdings' })
    getHoldings(@Request() req: any) {
        return this.assetsService.findAllHoldings(req.user.userId);
    }

    @Post('accounts/:id/holdings')
    @ApiOperation({ summary: 'Add a holding to an account' })
    addHolding(@Param('id') accountId: number, @Body() body: any) {
        return this.assetsService.createHolding(accountId, body);
    }
}
