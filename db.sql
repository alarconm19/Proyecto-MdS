CREATE DATABASE IF NOT EXISTS `pweb`;
USE `pweb`;

    CREATE TABLE IF NOT EXISTS `users` (
        `user_id` INT AUTO_INCREMENT PRIMARY KEY,
        `username` VARCHAR(255) NOT NULL UNIQUE,
        `password` VARCHAR(255) NOT NULL
    );