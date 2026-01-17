import { ApiProperty } from '@nestjs/swagger';

export class ZakatRequestDto {
    @ApiProperty({ example: 10000 })
    portfolio_valuation_usd: number;

    @ApiProperty({ example: ['Car', 'House'] })
    non_zakat_assets: string[];

    @ApiProperty({ example: 6000 })
    nisab_usd: number;
}
