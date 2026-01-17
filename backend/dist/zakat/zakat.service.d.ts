import { AssetsService } from '../assets/assets.service';
import { ZakatRequestDto } from './dto/zakat-request.dto';
export declare class ZakatService {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    calculate(data: ZakatRequestDto): {
        zakat_due_usd: number;
        message: string;
        nisab_status: string;
        currency?: undefined;
        calculation_basis?: undefined;
    } | {
        zakat_due_usd: number;
        currency: string;
        calculation_basis: string;
        nisab_status: string;
        message?: undefined;
    };
    calculateFromSystem(userId: string): Promise<{
        total_assets_sar: number;
        total_assets_usd: string;
        zakat_due_sar: string;
        zakat_due_usd: string;
        nisab_threshold_usd: number;
        is_above_nisab: boolean;
        breakdown: {
            cash_sar: number;
            investments_sar: number;
            details: {
                name: string;
                amount: number;
                type: string;
                originalCurrency: string;
            }[];
        };
    }>;
}
