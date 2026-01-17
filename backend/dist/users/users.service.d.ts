import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Envelope } from '../budget/entities/envelope.entity';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
export declare class UsersService {
    private usersRepository;
    private envelopeRepository;
    constructor(usersRepository: Repository<User>, envelopeRepository: Repository<Envelope>);
    findOneByEmail(email: string): Promise<User | null>;
    findOneById(id: string): Promise<User | null>;
    create(userData: Partial<User>): Promise<User>;
    private initializeUserEnvelopes;
    updateOnboarding(userId: string, dto: UpdateOnboardingDto): Promise<User>;
    updateSettings(userId: string, dto: any): Promise<User>;
    updateCurrency(userId: string, currency: string): Promise<User>;
}
