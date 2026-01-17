import { Controller, Post, Get, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ZakatService } from './zakat.service';
import { ZakatRequestDto } from './dto/zakat-request.dto';

@ApiTags('Zakat')
@UseGuards(JwtAuthGuard)
@Controller('zakat')
export class ZakatController {
    constructor(private readonly zakatService: ZakatService) { }

    @Post('calculate')
    @ApiOperation({ summary: 'Calculate Zakat for assets (Manual Input)' })
    calculate(@Body() body: ZakatRequestDto) {
        return this.zakatService.calculate(body);
    }

    @Get('calculate/system')
    @ApiOperation({ summary: 'Calculate Zakat from System Assets' })
    calculateSystem(@Request() req: any) {
        // Import Request from common if needed, assuming usage
        return this.zakatService.calculateFromSystem(req.user.userId);
    }
}
