import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, Delete } from '@nestjs/common';
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

    @Patch('accounts/:id')
    @ApiOperation({ summary: 'Update an account' })
    updateAccount(@Request() req: any, @Param('id') id: string, @Body() body: any) {
        return this.assetsService.updateAccount(id, req.user.userId, body);
    }

    @Delete('accounts/:id')
    @ApiOperation({ summary: 'Delete an account' })
    deleteAccount(@Request() req: any, @Param('id') id: string) {
        return this.assetsService.removeAccount(id, req.user.userId);
    }

    @Delete('holdings/:id')
    @ApiOperation({ summary: 'Delete a holding' })
    deleteHolding(@Request() req: any, @Param('id') id: string) {
        return this.assetsService.removeHolding(id, req.user.userId);
    }
}
