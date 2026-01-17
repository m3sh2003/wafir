-- 1. Insert Sample Assets (if they don't exist)
INSERT INTO assets (id, name, symbol, type, "riskLevel", "currentPrice", "expectedReturn", "minInvestment", "isZakatable", "isShariaCompliant", "createdAt", "updatedAt")
VALUES 
('d1111111-1111-1111-1111-111111111111', 'Saudi Aramco', '2222', 'Equity', 'Medium', 32.50, 4.5, 100.00, true, true, NOW(), NOW()),
('d2222222-2222-2222-2222-222222222222', 'Al Rajhi Bank', '1120', 'Equity', 'Low', 75.20, 3.2, 500.00, true, true, NOW(), NOW()),
('d3333333-3333-3333-3333-333333333333', 'Wafir Growth Fund', 'WGF', 'Fund', 'High', 15.00, 12.0, 1000.00, true, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Sample Account (if not exists) linking to text-based email user
DO $$
DECLARE
    user_id_val uuid;
BEGIN
    -- Get the ID of the user 'ahmed@example.com'
    SELECT id INTO user_id_val FROM users WHERE email = 'ahmed@example.com' LIMIT 1;

    -- If user exists, insert account
    IF user_id_val IS NOT NULL THEN
        -- Matches Account Entity: id, name, currency_code, balance, type, is_primary, user_id
        -- Omitted: accountNumber, bankName, createdAt, updatedAt (not in entity)
        INSERT INTO accounts (id, name, "currency_code", "user_id", type, balance, "is_primary")
        VALUES 
        (1, 'Investment Portfolio', 'SAR', user_id_val, 'bank', 5000.00, false)
        ON CONFLICT (id) DO NOTHING;
        
        -- 3. Insert Sample Holdings linked to the Account
        -- Matches Holding Entity: id, instrument_code, asset_id, units, is_primary_home, account_id
        INSERT INTO holdings (id, instrument_code, asset_id, units, is_primary_home, account_id)
        VALUES 
        (1, '2222', 'd1111111-1111-1111-1111-111111111111', 1000, false, 1), -- 1000 shares of Aramco
        (2, '1120', 'd2222222-2222-2222-2222-222222222222', 200, false, 1),  -- 200 shares of Al Rajhi
        (3, 'WGF', 'd3333333-3333-3333-3333-333333333333', 500, false, 1)   -- 500 units of Wafir Fund
        ON CONFLICT (id) DO NOTHING;

        -- Fix sequences
        PERFORM setval('accounts_id_seq', (SELECT MAX(id) FROM accounts));
        PERFORM setval('holdings_id_seq', (SELECT MAX(id) FROM holdings));
    ELSE
        RAISE NOTICE 'User ahmed@example.com not found. Please create the user first.';
    END IF;
END $$;
