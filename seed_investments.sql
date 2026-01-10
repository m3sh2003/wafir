-- Existing Users (Ignored if conflict)
INSERT INTO users (id, email, name, settings, "createdAt", "updatedAt") 
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ahmed@example.com', 'Ahmed', '{"currency": "SAR", "locale": "ar-SA"}', NOW(), NOW()) 
ON CONFLICT (email) DO NOTHING;

-- Envelopes (Ignored if conflict, but IDs are random so avoiding dupes is tricky without check. For dev we can assume clean or ignore. 
-- Actually, ON CONFLICT requires a constraint match. UUIDs are unique. 
-- Let's just append the Investments.

INSERT INTO investment_products (id, name, type, "riskLevel", "expectedReturn", "minInvestment", description, "createdAt", "updatedAt") 
VALUES 
(gen_random_uuid(), 'Sway Sukuk Fund', 'Sukuk', 'Low', 4.50, 1000.00, 'Low-risk government backed Sukuk with stable returns.', NOW(), NOW()),
(gen_random_uuid(), 'Wafir Growth ETF', 'ETF', 'High', 12.00, 500.00, 'High-growth Sharia-compliant equity ETF targeting tech sector.', NOW(), NOW()),
(gen_random_uuid(), 'Mecca REIT', 'REIT', 'Medium', 6.50, 2000.00, 'Real estate income trust focused on hospitality assets in Makkah.', NOW(), NOW());
