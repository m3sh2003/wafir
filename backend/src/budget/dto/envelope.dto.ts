import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnvelopeDto {
    @ApiProperty({ example: 'Groceries' })
    @IsString()
    name: string;

    @ApiProperty({ example: 1500.00 })
    @IsNumber()
    limitAmount: number;

    @ApiProperty({ example: 'Monthly', required: false })
    @IsOptional()
    @IsString()
    period?: string;
}

export class UpdateEnvelopeDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    limitAmount?: number;
}
