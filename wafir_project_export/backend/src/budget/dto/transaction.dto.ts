import { IsNotEmpty, IsNumber, IsString, IsUUID, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    envelopeId: string;

    @ApiProperty()
    @IsOptional()
    @IsDateString()
    date?: string;
}
