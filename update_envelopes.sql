-- Remove existing envelopes
DELETE FROM envelopes WHERE "userId" = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- Insert Keys (Clean English) to be translated by Frontend
INSERT INTO envelopes (id, name, "limitAmount", period, "userId") VALUES 
(gen_random_uuid(), 'groceries', 2000.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'housing', 3000.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'transport', 800.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'bills', 500.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'restaurants', 600.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'health', 400.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'shopping', 500.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'education', 0.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'entertainment', 300.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'savings', 1000.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
