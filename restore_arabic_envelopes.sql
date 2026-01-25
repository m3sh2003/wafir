-- Delete existing seed envelopes
DELETE FROM envelopes WHERE "userId" = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- Insert Arabic Envelopes
INSERT INTO envelopes (id, name, "limitAmount", period, "userId") VALUES 
(gen_random_uuid(), 'المأكل والمشرب', 2000.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'السكن', 3000.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'النقل والمواصلات', 800.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'الفواتير والخدمات', 500.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'المطاعم والمقاهي', 600.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'العناية الشخصية', 400.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'التسوق', 500.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'التعليم', 0.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'الترفيه', 300.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'الادخار', 1000.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'الصدقة', 200.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'الهدايا', 150.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'صندوق الطوارئ', 500.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'السفر', 0.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'زكاة المال', 0.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
(gen_random_uuid(), 'الاستثمار', 1000.00, 'Monthly', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
