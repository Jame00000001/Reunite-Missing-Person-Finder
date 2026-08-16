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
DROP TABLE IF EXISTS `reports`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'admin') DEFAULT 'user',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
  `report_date` DATE NOT NULL,
  `report_time` VARCHAR(30) NULL,
  `clothing_description` TEXT NULL,
  `additional_info` TEXT NULL,
  `contact_phone` VARCHAR(50) NOT NULL,
  `status` ENUM('Pending', 'Missing', 'Found', 'Reunited', 'Closed') DEFAULT 'Pending',
  `admin_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reports_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 3. Initial Sample Data (Seeds)
-- Passwords:
-- admin@reunite.org -> admin123 (hashed with bcrypt)
-- user@example.com -> user123 (hashed with bcrypt)
-- sarah@example.com -> user123 (hashed with bcrypt)
-- ----------------------------------------------------------

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `role`) VALUES
(1, 'System Administrator', 'admin@reunite.org', '+1 (800) 555-0199', '$2a$10$w8T06v1BwF0y85vDkRz6Aeu5y.rDmsU7j3rG1h3rXy6sM2I2bIu8a', 'admin'),
(2, 'Michael Davis', 'user@example.com', '+1 (555) 234-5678', '$2a$10$w8T06v1BwF0y85vDkRz6Aeu5y.rDmsU7j3rG1h3rXy6sM2I2bIu8a', 'user'),
(3, 'Sarah Jenkins', 'sarah@example.com', '+1 (555) 876-5432', '$2a$10$w8T06v1BwF0y85vDkRz6Aeu5y.rDmsU7j3rG1h3rXy6sM2I2bIu8a', 'user');

INSERT INTO `reports` (`id`, `user_id`, `report_type`, `name`, `age`, `gender`, `photo_url`, `location`, `report_date`, `report_time`, `clothing_description`, `additional_info`, `contact_phone`, `status`, `admin_notes`) VALUES
(1, 2, 'missing', 'Lucas Davis', 7, 'Male', 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=600&auto=format&fit=crop&q=80', 'Greenwood Central Park Playground, Springfield', '2026-08-14', '04:30 PM', 'Blue dinosaur t-shirt, beige cargo shorts, red light-up sneakers', 'Speaks English and basic Spanish. Friendly, has a small birthmark on his left forearm. Might respond to the nickname Luke.', '+1 (555) 234-5678', 'Missing', 'Verified with local police station incident report #2026-SP-882.'),
(2, 3, 'missing', 'Eleanor Vance', 78, 'Female', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80', 'Oakridge Senior Living & Market Square, Downtown', '2026-08-15', '11:15 AM', 'Floral lilac cardigan, dark grey trousers, brown orthopedic shoes, wearing gold-rimmed reading glasses', 'Diagnosed with mild Alzheimer’s and short-term memory disorientation. Wanders when seeking her garden. Very gentle.', '+1 (555) 876-5432', 'Missing', 'Urgent medical care needed. Broadcast sent to city transit operators.'),
(3, 2, 'found', 'Unknown Toddler (Responds to Emma)', 4, 'Female', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&auto=format&fit=crop&q=80', 'Metro Subway Station Entrance - North Line', '2026-08-16', '08:00 AM', 'Yellow hooded jacket with duck cartoon, polka dot leggings, pink boots', 'Currently in safe care at Metro Transit Police Station Booth 4. Safe and in good health, carrying a small teddy bear.', '+1 (555) 999-1122', 'Found', 'Report verified by Metro Transit safety officer on duty.'),
(4, 3, 'missing', 'David Miller', 12, 'Male', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80', 'Lincoln Middle School Sports Ground', '2026-08-12', '03:45 PM', 'School navy hoodie, black jeans, white Nike backpack', 'Was seen heading towards Riverview bicycle trail with a black mountain bike.', '+1 (555) 345-9876', 'Reunited', 'Family confirmed David was safely located at his friend residence and returned home.'),
(5, 2, 'missing', 'Robert Chen', 82, 'Male', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80', 'Sunnydale Community Pharmacy, East Wing', '2026-08-15', '02:00 PM', 'Navy blue windbreaker, khaki slacks, grey walking cap', 'Speaks Cantonese and English. Walks with a slight limp using a dark wooden cane.', '+1 (555) 456-1122', 'Pending', 'Pending administrator verification of guardian ID.');
