INSERT INTO users (id, email, name, settings, "createdAt", "updatedAt") 
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ahmed@example.com', 'Ahmed', '{"currency": "SAR", "locale": "ar-SA"}', NOW(), NOW()) 
ON CONFLICT (email) DO NOTHING;

INSERT INTO envelopes (id, name, "limitAmount", period, "userId") 
VALUES (gen_random_uuid(), 'Groceries', 1500.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

INSERT INTO envelopes (id, name, "limitAmount", period, "userId") 
VALUES (gen_random_uuid(), 'Transport', 500.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

INSERT INTO envelopes (id, name, "limitAmount", period, "userId") 
VALUES (gen_random_uuid(), 'Utilities', 300.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
