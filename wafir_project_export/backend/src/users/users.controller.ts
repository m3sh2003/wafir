import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';

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
}
