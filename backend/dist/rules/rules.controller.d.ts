import { RulesService } from './rules.service';
export declare class RulesController {
    private readonly rulesService;
    constructor(rulesService: RulesService);
    findAll(req: any): Promise<import("./entities/transfer-rule.entity").TransferRule[]>;
    create(req: any, body: any): Promise<import("./entities/transfer-rule.entity").TransferRule>;
}
