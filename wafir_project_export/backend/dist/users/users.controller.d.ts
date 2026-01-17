import { UsersService } from './users.service';
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
}
