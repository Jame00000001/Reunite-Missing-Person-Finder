-- ==========================================================
-- Reunite – Missing Person Finder Database Schema
-- Database: reunite_db
-- University Software Engineering Project
-- ==========================================================

CREATE DATABASE IF NOT EXISTS reunite_db;
USE reunite_db;

-- ----------------------------------------------------------
-- 1. Table structure for table `users`
-- ----------------------------------------------------------
DROP TABLE IF EXISTS `notification_logs`;
DROP TABLE IF EXISTS `push_subscriptions`;
DROP TABLE IF EXISTS `reports`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'admin') DEFAULT 'user',
  `latitude` DECIMAL(10, 8) NULL,
  `longitude` DECIMAL(11, 8) NULL,
  `location_label` VARCHAR(255) NULL,
  `notifications_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `location_updated_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_geo` (`notifications_enabled`, `latitude`, `longitude`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 2. Table structure for table `reports`
-- ----------------------------------------------------------
CREATE TABLE `reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `report_type` ENUM('missing', 'found') NOT NULL,
  `name` VARCHAR(150) NULL,
  `age` INT NOT NULL,
  `gender` ENUM('Male', 'Female', 'Other') NOT NULL,
  `photo_url` LONGTEXT NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(10, 8) NULL,
  `longitude` DECIMAL(11, 8) NULL,
  `place_id` VARCHAR(255) NULL,
  `report_date` DATE NOT NULL,
  `report_time` VARCHAR(30) NULL,
  `clothing_description` TEXT NULL,
  `additional_info` TEXT NULL,
  `contact_phone` VARCHAR(50) NOT NULL,
  `status` ENUM('Pending', 'Missing', 'Found', 'Reunited', 'Closed') DEFAULT 'Pending',
  `admin_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_reports_geo` (`latitude`, `longitude`),
  CONSTRAINT `fk_reports_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 3. Table structure for table `push_subscriptions`
-- ----------------------------------------------------------
CREATE TABLE `push_subscriptions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `endpoint` VARCHAR(512) NOT NULL UNIQUE,
  `p256dh` VARCHAR(255) NOT NULL,
  `auth` VARCHAR(255) NOT NULL,
  `user_agent` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_push_user` (`user_id`),
  CONSTRAINT `fk_push_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 4. Table structure for table `notification_logs`
-- ----------------------------------------------------------
CREATE TABLE `notification_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `report_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `distance_km` DECIMAL(6, 2) NOT NULL,
  `delivery_status` ENUM('sent', 'failed', 'in_app_only') NOT NULL DEFAULT 'in_app_only',
  `error_message` TEXT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_report_user` (`report_id`, `user_id`),
  INDEX `idx_notif_user` (`user_id`, `sent_at`),
  CONSTRAINT `fk_notif_report` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 5. Initial Sample Data (Seeds)
-- Passwords:
-- admin@reunite.org -> admin123 (hashed with bcrypt)
-- user@example.com -> user123 (hashed with bcrypt)
-- sarah@example.com -> user123 (hashed with bcrypt)
-- ----------------------------------------------------------

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `role`, `latitude`, `longitude`, `location_label`, `notifications_enabled`) VALUES
(1, 'System Administrator', 'admin@reunite.org', '+1 (800) 555-0199', '$2a$10$w8T06v1BwF0y85vDkRz6Aeu5y.rDmsU7j3rG1h3rXy6sM2I2bIu8a', 'admin', 39.78172130, -89.65014810, 'Springfield City Center', 1),
(2, 'Michael Davis', 'user@example.com', '+1 (555) 234-5678', '$2a$10$w8T06v1BwF0y85vDkRz6Aeu5y.rDmsU7j3rG1h3rXy6sM2I2bIu8a', 'user', 39.79897630, -89.64436880, 'North Springfield', 1),
(3, 'Sarah Jenkins', 'sarah@example.com', '+1 (555) 876-5432', '$2a$10$w8T06v1BwF0y85vDkRz6Aeu5y.rDmsU7j3rG1h3rXy6sM2I2bIu8a', 'user', 39.77120000, -89.66150000, 'Oakridge District, Springfield', 1);

INSERT INTO `reports` (`id`, `user_id`, `report_type`, `name`, `age`, `gender`, `photo_url`, `location`, `latitude`, `longitude`, `place_id`, `report_date`, `report_time`, `clothing_description`, `additional_info`, `contact_phone`, `status`, `admin_notes`) VALUES
(1, 2, 'missing', 'Lucas Davis', 7, 'Male', 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=600&auto=format&fit=crop&q=80', 'Greenwood Central Park Playground, Springfield', 39.79245000, -89.65520000, NULL, '2026-08-14', '04:30 PM', 'Blue dinosaur t-shirt, beige cargo shorts, red light-up sneakers', 'Speaks English and basic Spanish. Friendly, has a small birthmark on his left forearm. Might respond to the nickname Luke.', '+1 (555) 234-5678', 'Missing', 'Verified with local police station incident report #2026-SP-882.'),
(2, 3, 'missing', 'Eleanor Vance', 78, 'Female', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80', 'Oakridge Senior Living & Market Square, Downtown', 39.77650000, -89.65840000, NULL, '2026-08-15', '11:15 AM', 'Floral lilac cardigan, dark grey trousers, brown orthopedic shoes, wearing gold-rimmed reading glasses', 'Diagnosed with mild Alzheimer’s and short-term memory disorientation. Wanders when seeking her garden. Very gentle.', '+1 (555) 876-5432', 'Missing', 'Urgent medical care needed. Broadcast sent to city transit operators.'),
(3, 2, 'found', 'Unknown Toddler (Responds to Emma)', 4, 'Female', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&auto=format&fit=crop&q=80', 'Metro Subway Station Entrance - North Line', 39.80120000, -89.64380000, NULL, '2026-08-16', '08:00 AM', 'Yellow hooded jacket with duck cartoon, polka dot leggings, pink boots', 'Currently in safe care at Metro Transit Police Station Booth 4. Safe and in good health, carrying a small teddy bear.', '+1 (555) 999-1122', 'Found', 'Report verified by Metro Transit safety officer on duty.'),
(4, 3, 'missing', 'David Miller', 12, 'Male', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80', 'Lincoln Middle School Sports Ground', 39.78610000, -89.67130000, NULL, '2026-08-12', '03:45 PM', 'School navy hoodie, black jeans, white Nike backpack', 'Was seen heading towards Riverview bicycle trail with a black mountain bike.', '+1 (555) 345-9876', 'Reunited', 'Family confirmed David was safely located at his friend residence and returned home.'),
(5, 2, 'missing', 'Robert Chen', 82, 'Male', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80', 'Sunnydale Community Pharmacy, East Wing', 39.77980000, -89.62950000, NULL, '2026-08-15', '02:00 PM', 'Navy blue windbreaker, khaki slacks, grey walking cap', 'Speaks Cantonese and English. Walks with a slight limp using a dark wooden cane.', '+1 (555) 456-1122', 'Pending', 'Pending administrator verification of guardian ID.');
