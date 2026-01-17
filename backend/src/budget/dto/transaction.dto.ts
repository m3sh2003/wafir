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

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    envelopeId?: string;

    @ApiProperty()
    @IsOptional()
    @IsDateString()
    date?: string;

    @ApiProperty({ required: false, enum: ['INCOME', 'EXPENSE', 'TRANSFER'] })
    @IsOptional()
    @IsString()
    type?: string;
}
