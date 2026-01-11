import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvestmentsService } from './investments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Investments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('investments')
export class InvestmentsController {
    constructor(private readonly investmentsService: InvestmentsService) { }

    @Get('products')
    @ApiOperation({ summary: 'List all investment products' })
    findAllProducts() {
        return this.investmentsService.findAllProducts();
    }

    @Get('portfolio')
    @ApiOperation({ summary: 'Get user portfolio' })
    getPortfolio(@Request() req: any) {
        return this.investmentsService.getPortfolio(req.user.userId);
    }

    @Post('invest')
    @ApiOperation({ summary: 'Invest in a product' })
    invest(@Request() req: any, @Body() body: { productId: string; amount: number }) {
        return this.investmentsService.invest(req.user.userId, body.productId, body.amount);
    }

    @Post('sell')
    @ApiOperation({ summary: 'Sell an investment' })
    sell(@Request() req: any, @Body() body: { productId: string; amount: number }) {
        return this.investmentsService.sellInvestment(req.user.userId, body.productId, body.amount);
    }

    @Get('risk-profile')
    @ApiOperation({ summary: 'Get user risk profile' })
    async getRiskProfile(@Request() req: any) {
        return this.investmentsService.getRiskProfile(req.user.userId);
    }

    @Post('risk-profile')
    @ApiOperation({ summary: 'Calculate and set risk profile' })
    setRiskProfile(@Request() req: any, @Body() body: { score: number }) {
        return this.investmentsService.setRiskProfile(req.user.userId, body.score);
    }

    @Post('portfolio/rebalance')
    @ApiOperation({ summary: 'Rebalance portfolio according to Sharia/Risk constraints' })
    rebalance(@Request() req: any) {
        return this.investmentsService.rebalancePortfolio(req.user.userId);
    }
}
