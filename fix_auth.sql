-- Confirm the Auth User
UPDATE auth.users SET email_confirmed_at = now() WHERE id = '33516dfe-52d9-41f7-bf02-cc507f8e7746';

-- Create matching public user
INSERT INTO public.users (id, email, "password", name) 
VALUES ('33516dfe-52d9-41f7-bf02-cc507f8e7746', 'ahmed.test@gmail.com', 'dummy_hash', 'Ahmed Test')
ON CONFLICT (id) DO NOTHING;

-- Move Envelopes to new user
UPDATE public.envelopes SET "userId" = '33516dfe-52d9-41f7-bf02-cc507f8e7746' 
WHERE "userId" = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- Delete old user
DELETE FROM public.users WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
