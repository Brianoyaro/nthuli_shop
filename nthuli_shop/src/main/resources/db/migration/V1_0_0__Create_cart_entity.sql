-- Migration: Create Cart Entity
-- Description: Creates cart table with one-to-one relationship to users
-- Version: 1.0.0
-- Date: 2026-05-08

-- Create carts table
CREATE TABLE IF NOT EXISTS carts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_carts_user_id FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create index on user_id for faster lookups
CREATE UNIQUE INDEX idx_carts_user_id ON carts(user_id);

-- NOTE: Manual migration steps for existing cart items:
-- 1. If there are existing cart items (migrating from old schema):
--    a. Create carts for all users:
--       INSERT INTO carts (user_id, created_at, updated_at) 
--       SELECT DISTINCT user_id, NOW(), NOW() FROM cart_items 
--       WHERE user_id NOT IN (SELECT user_id FROM carts);
--
--    b. Update cart_items to add cart_id column:
--       ALTER TABLE cart_items ADD COLUMN cart_id BIGINT;
--
--    c. Migrate data from user_id to cart_id:
--       UPDATE cart_items ci 
--       SET cart_id = (SELECT id FROM carts WHERE user_id = ci.user_id);
--
--    d. Set NOT NULL constraint and drop user_id:
--       ALTER TABLE cart_items MODIFY COLUMN cart_id BIGINT NOT NULL;
--       ALTER TABLE cart_items DROP FOREIGN KEY fk_cart_items_user_id;
--       ALTER TABLE cart_items DROP COLUMN user_id;
--
--    e. Add foreign key constraint:
--       ALTER TABLE cart_items 
--       ADD CONSTRAINT fk_cart_items_cart_id 
--       FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE;
