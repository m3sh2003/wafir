
import { IsEnum, IsNumber, IsOptional, IsObject, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RiskProfile {
    CONSERVATIVE = 'Conservative',
    BALANCED = 'Balanced',
    AGGRESSIVE = 'Aggressive'
}

export class UpdateOnboardingDto {
    @ApiProperty({ enum: RiskProfile, example: 'Balanced' })
    @IsEnum(RiskProfile)
    riskProfile: RiskProfile;

    @ApiProperty({ example: 5000, description: 'Monthly income in base currency' })
    @IsNumber()
    @Min(0)
    monthlyIncome: number;

    @ApiProperty({
        example: { 'Groceries': 1500, 'Transport': 300 },
        description: 'Key-value pair of Category Name -> Limit Amount'
    })
    @IsObject()
    budgetLimits: Record<string, number>;
}
