-- ====================================================================
-- ONLINE MOVIE TICKET BOOKING SYSTEM - DATABASE SCRIPT
-- ====================================================================
-- Database: movie_booking_db
-- Tables:
--   1. users: user_id, name, email, phone
--   2. movies: movie_id, title, language, duration, release_data
--   3. shows: show_id, movie_id, theatre_name, show_date, show_time, ticket_price
--   4. bookings: bookings_id, user_id, show_id, seats, seat_numbers, total_amount, booking_status, booking_date
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `movie_booking_db`;
USE `movie_booking_db`;

-- --------------------------------------------------------
-- Table 1: users
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(20) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table 2: movies
-- Exact specified fields: movie_id, title, language, duration, release_data
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `movies` (
  `movie_id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `language` VARCHAR(30) NOT NULL,
  `duration` INT NOT NULL, -- duration in minutes
  `release_data` DATE NOT NULL,
  `genre` VARCHAR(60) DEFAULT 'Action / Sci-Fi',
  `poster_url` VARCHAR(255) DEFAULT '',
  `description` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table 3: shows
-- Exact specified fields: show_id, movie_id, theatre_name, show_date, show_time, ticket_price
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `shows` (
  `show_id` INT AUTO_INCREMENT PRIMARY KEY,
  `movie_id` INT NOT NULL,
  `theatre_name` VARCHAR(100) NOT NULL,
  `show_date` DATE NOT NULL,
  `show_time` TIME NOT NULL,
  `ticket_price` DECIMAL(10,2) NOT NULL,
  `screen_name` VARCHAR(50) DEFAULT 'Screen 1',
  CONSTRAINT `fk_shows_movies` FOREIGN KEY (`movie_id`) 
    REFERENCES `movies` (`movie_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table 4: bookings
-- Exact specified fields: bookings_id, user_id, seats, total_amount, booking_status
-- Plus show_id & seat_numbers for complete relational integrity
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bookings` (
  `bookings_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `show_id` INT NOT NULL,
  `seats` INT NOT NULL,
  `seat_numbers` VARCHAR(150) DEFAULT '',
  `total_amount` DECIMAL(10,2) NOT NULL,
  `booking_status` VARCHAR(30) NOT NULL DEFAULT 'Confirmed',
  `booking_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_bookings_users` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_shows` FOREIGN KEY (`show_id`) 
    REFERENCES `shows` (`show_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- SAMPLE SEED DATA
-- ========================================================

-- Insert Sample Users
INSERT INTO `users` (`user_id`, `name`, `email`, `phone`) VALUES
(1, 'Alice Johnson', 'alice@example.com', '9876543210'),
(2, 'Bob Williams', 'bob@example.com', '9876543211'),
(3, 'Charlie Davis', 'charlie@example.com', '9876543212'),
(4, 'David Miller', 'david@example.com', '9876543213'),
(5, 'Emma Watson', 'emma@example.com', '9876543214'),
(6, 'Frank Castle', 'frank@example.com', '9876543215'),
(7, 'Grace Hopper', 'grace@example.com', '9876543216'),
(8, 'Harry Potter', 'harry@example.com', '9876543217'),
(9, 'Ian Malcolm', 'ian@example.com', '9876543218'),
(10, 'Julia Roberts', 'julia@example.com', '9876543219')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Insert Sample Movies
INSERT INTO `movies` (`movie_id`, `title`, `language`, `duration`, `release_data`, `genre`, `poster_url`, `description`) VALUES
(1, 'Inception', 'English', 148, '2024-05-15', 'Sci-Fi / Thriller', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80', 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.'),
(2, 'Interstellar', 'English', 169, '2024-06-10', 'Sci-Fi / Adventure', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80', 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft to find a new planet.'),
(3, 'RRR: Rise Roar Revolt', 'Telugu', 187, '2024-04-20', 'Action / Drama', 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80', 'A fearless warrior and a legendary cop in 1920s British India wage war against British colonial oppression.'),
(4, 'Jawan', 'Hindi', 169, '2024-03-12', 'Action / Thriller', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80', 'A high-octane action thriller outlining the emotional journey of a man who is set to rectify the wrongs in the society.'),
(5, 'Leo', 'Tamil', 164, '2024-07-01', 'Action / Crime', 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&auto=format&fit=crop&q=80', 'A mild-mannered cafe owner in Kashmir becomes a hero after an incident, but dark shadows from his past soon catch up.'),
(6, 'Spider-Man: Beyond The Multiverse', 'English', 140, '2024-08-18', 'Animation / Adventure', 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&auto=format&fit=crop&q=80', 'Miles Morales catapults across the Multiverse to save every universe of Spider-People from a shadowy existential threat.')
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- Insert Sample Shows
INSERT INTO `shows` (`show_id`, `movie_id`, `theatre_name`, `show_date`, `show_time`, `ticket_price`, `screen_name`) VALUES
(1, 1, 'PVR Cinemas - Screen 1', '2026-11-10', '10:30:00', 250.00, 'Audi 1 (Dolby Atmos)'),
(2, 1, 'IMAX Mega Cinepolis', '2026-11-10', '14:15:00', 380.00, 'IMAX 3D Laser'),
(3, 1, 'INOX Grand Multiplex', '2026-11-10', '18:45:00', 280.00, 'Screen 3'),
(4, 2, 'PVR Cinemas - Screen 2', '2026-11-10', '11:00:00', 300.00, 'Audi 2'),
(5, 2, 'IMAX Mega Cinepolis', '2026-11-10', '19:30:00', 420.00, 'IMAX 3D Laser'),
(6, 3, 'Miraj Cinemas Downtown', '2026-11-10', '13:00:00', 220.00, 'Screen 1'),
(7, 3, 'INOX Grand Multiplex', '2026-11-10', '21:00:00', 250.00, 'Screen 2'),
(8, 4, 'PVR Cinemas - Screen 3', '2026-11-11', '15:30:00', 260.00, 'Audi 3'),
(9, 5, 'AGS Cinemas Royal', '2026-11-11', '18:00:00', 240.00, 'Screen 4'),
(10, 6, 'Cinepolis Mega Mall', '2026-11-11', '12:30:00', 320.00, '4DX Screen')
ON DUPLICATE KEY UPDATE `theatre_name`=VALUES(`theatre_name`);

-- Insert Sample Bookings
INSERT INTO `bookings` (`bookings_id`, `user_id`, `show_id`, `seats`, `seat_numbers`, `total_amount`, `booking_status`, `booking_date`) VALUES
(101, 1, 1, 2, 'C4, C5', 500.00, 'Confirmed', '2026-11-06 14:22:00'),
(102, 2, 2, 3, 'D7, D8, D9', 1140.00, 'Confirmed', '2026-11-06 16:45:00'),
(103, 3, 5, 1, 'B2', 420.00, 'Confirmed', '2026-11-07 09:10:00'),
(104, 4, 4, 3, 'A1, A2, A3', 2000.00, 'Confirmed', '2026-11-06 16:45:00')
ON DUPLICATE KEY UPDATE `booking_status`=VALUES(`booking_status`);
