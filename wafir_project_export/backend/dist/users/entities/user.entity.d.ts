export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    settings: Record<string, any>;
    riskProfile: string;
    createdAt: Date;
    updatedAt: Date;
}
