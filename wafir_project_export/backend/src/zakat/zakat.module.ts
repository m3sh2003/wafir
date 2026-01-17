import { Module } from '@nestjs/common';
import { ZakatController } from './zakat.controller';
import { ZakatService } from './zakat.service';
import { AssetsModule } from '../assets/assets.module';

@Module({
    imports: [AssetsModule],
    controllers: [ZakatController],
    providers: [ZakatService],
})
export class ZakatModule { }
