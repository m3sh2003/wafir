import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class UpdateSettingsDto {
    @IsOptional()
    @IsEnum(['ar', 'en'])
    language?: 'ar' | 'en';

    @IsOptional()
    @IsEnum(['light', 'dark'])
    theme?: 'light' | 'dark';

    @IsOptional()
    @IsEnum(['SAR', 'USD', 'EGP'])
    currency?: 'SAR' | 'USD' | 'EGP';

    @IsOptional()
    @IsNumber()
    usdRate?: number;

    @IsOptional()
    @IsNumber()
    egpRate?: number;
}
