import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferRule } from './entities/transfer-rule.entity';
import { RulesService } from './rules.service';
import { RulesController } from './rules.controller';

@Module({
    imports: [TypeOrmModule.forFeature([TransferRule])],
    controllers: [RulesController],
    providers: [RulesService],
    exports: [RulesService],
})
export class RulesModule { }
