import { UsersService } from './users.service';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
        id: string;
        email: string;
        name: string;
        settings: Record<string, any>;
        riskProfile: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    updateOnboarding(req: any, dto: UpdateOnboardingDto): Promise<import("./entities/user.entity").User>;
    updateSettings(req: any, dto: any): Promise<import("./entities/user.entity").User>;
    updateCurrency(req: any, body: {
        currency: string;
    }): Promise<import("./entities/user.entity").User>;
    updateProfile(req: any, dto: any): Promise<import("./entities/user.entity").User>;
}
