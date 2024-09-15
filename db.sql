-- Active: 1726380768104@@127.0.0.1@3306@pweb
CREATE DATABASE IF NOT EXISTS `pweb`; 

USE `pweb`;

CREATE TABLE IF NOT EXISTS `users` (
    `user_id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS `comentarios` (
    `comentario` VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS `clientes` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo_electronico VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS `reservas` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    turno_id INT NOT NULL,
    fecha_reserva DATETIME NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (turno_id) REFERENCES turnos(id)
);

CREATE TABLE IF NOT EXISTS `turnos` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(255),
    fecha_hora DATETIME NOT NULL,
    duracion INT NOT NULL, -- Duración del turno en minutos
    disponibilidad INT NOT NULL -- Número de turnos disponibles
);

