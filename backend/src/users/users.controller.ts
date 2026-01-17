import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiOperation({ summary: 'Get current user profile' })
    async getProfile(@Request() req: any) {
        // req.user contains { userId, email } from JwtStrategy
        const user = await this.usersService.findOneById(req.user.userId);
        if (!user) return null;
        const { passwordHash, ...result } = user;
        return result;
    }
    @UseGuards(JwtAuthGuard)
    @Patch('onboarding')
    @ApiOperation({ summary: 'Update user profile and budget limits' })
    async updateOnboarding(@Request() req: any, @Body() dto: UpdateOnboardingDto) {
        return this.usersService.updateOnboarding(req.user.userId, dto);
    }
    @UseGuards(JwtAuthGuard)
    @Patch('settings')
    @ApiOperation({ summary: 'Update user settings (currency, theme, etc.)' })
    async updateSettings(@Request() req: any, @Body() dto: any) {
        return this.usersService.updateSettings(req.user.userId, dto);
    }

    @Patch('currency')
    @ApiOperation({ summary: 'Update user currency specifically' })
    async updateCurrency(@Request() req: any, @Body() body: { currency: string }) {
        return this.usersService.updateCurrency(req.user.userId, body.currency);
    }
}
