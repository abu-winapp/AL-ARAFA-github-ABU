-- Al-Arafa Restaurant - Create Admin User
-- Run this SQL script in your PostgreSQL database to create the admin user

-- Password: admin123
-- BCrypt Hash: $2a$10$N9qo8uLOickgx2ZMRZoMye7tFZcKIhN2yP0KppF0iK8M9RZhJlgWi

INSERT INTO users (
  id,
  phone,
  email,
  full_name,
  password_hash,
  user_type,
  status,
  loyalty_points,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  '+6512345678',                                                           -- Admin phone
  'admin@salembriyani.sg',                                                 -- Admin email
  'Admin User',                                                            -- Full name
  '$2a$10$N9qo8uLOickgx2ZMRZoMye7tFZcKIhN2yP0KppF0iK8M9RZhJlgWi',        -- Password: admin123
  'admin',                                                                 -- User type (IMPORTANT!)
  'active',                                                                -- Status
  0,                                                                       -- Loyalty points
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@salembriyani.sg'
);

-- Verify admin user was created
SELECT id, email, full_name, user_type, status
FROM users
WHERE email = 'admin@salembriyani.sg';

-- Expected output:
-- id: (some UUID)
-- email: admin@salembriyani.sg
-- full_name: Admin User
-- user_type: admin
-- status: active

-- IMPORTANT: Change the password after first login!
-- Use this BCrypt hash for a different password:
-- 1. Generate at: https://bcrypt-generator.com/
-- 2. Update with: UPDATE users SET password_hash = '$2a$10$YOUR_NEW_HASH' WHERE email = 'admin@salembriyani.sg';
