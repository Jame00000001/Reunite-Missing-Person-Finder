-- ==========================================================
-- Migration 001: Google Maps Coordinates & Location-Based Push Notifications
-- Run this against an existing `reunite_db` MySQL database to upgrade
-- without dropping existing users or reports.
-- ==========================================================

USE reunite_db;

ALTER TABLE `users`
  ADD COLUMN `latitude` DECIMAL(10, 8) NULL AFTER `role`,
  ADD COLUMN `longitude` DECIMAL(11, 8) NULL AFTER `latitude`,
  ADD COLUMN `location_label` VARCHAR(255) NULL AFTER `longitude`,
  ADD COLUMN `notifications_enabled` TINYINT(1) NOT NULL DEFAULT 1 AFTER `location_label`,
  ADD COLUMN `location_updated_at` TIMESTAMP NULL AFTER `notifications_enabled`,
  ADD INDEX `idx_users_geo` (`notifications_enabled`, `latitude`, `longitude`);

ALTER TABLE `reports`
  ADD COLUMN `latitude` DECIMAL(10, 8) NULL AFTER `location`,
  ADD COLUMN `longitude` DECIMAL(11, 8) NULL AFTER `latitude`,
  ADD COLUMN `place_id` VARCHAR(255) NULL AFTER `longitude`,
  ADD INDEX `idx_reports_geo` (`latitude`, `longitude`);

CREATE TABLE IF NOT EXISTS `push_subscriptions` (
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

CREATE TABLE IF NOT EXISTS `notification_logs` (
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
