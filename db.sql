CREATE DATABASE IF NOT EXISTS pweb;
USE pweb;

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    role ENUM('cliente', 'empleado', 'admin') NOT NULL DEFAULT 'cliente'
);

CREATE TABLE IF NOT EXISTS turnos (
    turno_id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    nombre_servicio VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,  -- Solo la fecha
    hora TIME NOT NULL,   -- Solo la hora
    FOREIGN KEY (cliente_id) REFERENCES users(user_id)
);

CREATE TABLE comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    comentario TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);