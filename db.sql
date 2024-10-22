CREATE DATABASE IF NOT EXISTS pweb;
USE pweb;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    email VARCHAR(255) NOT NULL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    role ENUM('cliente', 'profesional', 'secretaria', 'admin') NOT NULL DEFAULT 'cliente'
);

-- Tabla de servicios
CREATE TABLE IF NOT EXISTS servicios (
    nombre VARCHAR(255) PRIMARY KEY,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL
);

-- Tabla de turnos
CREATE TABLE IF NOT EXISTS turnos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_email VARCHAR(255) NOT NULL,
    profesional_email VARCHAR(255) NOT NULL,
    nombre_servicio VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    FOREIGN KEY (cliente_email) REFERENCES users(email),
    FOREIGN KEY (profesional_email) REFERENCES users(email),
    FOREIGN KEY (nombre_servicio) REFERENCES servicios(nombre)
);

-- Tabla de pagos con integración de MercadoPago
CREATE TABLE IF NOT EXISTS pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_email VARCHAR(255) NOT NULL,
    turno_id INT NOT NULL UNIQUE,  -- Un turno solo puede tener un pago asociado
    tipo ENUM('credito', 'debito') NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_email) REFERENCES users(email),
    FOREIGN KEY (turno_id) REFERENCES turnos(id)
);

-- Tabla de comentarios (simplificada)
CREATE TABLE IF NOT EXISTS comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) DEFAULT 'Anonimo',
    comentario TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de consultas
CREATE TABLE IF NOT EXISTS consultas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contenido TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cliente_email VARCHAR(255) NOT NULL, -- Solo clientes registrados pueden hacer consultas
    respuesta TEXT, -- Respuesta de un empleado
    empleado_email VARCHAR(255), -- email del empleado que responde
    fecha_respuesta TIMESTAMP,
    estado_consulta ENUM('pendiente', 'respondida') DEFAULT 'pendiente',
    FOREIGN KEY (cliente_email) REFERENCES users(email),
    FOREIGN KEY (empleado_email) REFERENCES users(email)
);

CREATE VIEW vista_clientes AS
SELECT user_id, username, email, telefono, direccion
FROM users
WHERE role = 'cliente';

INSERT INTO servicios(nombre_servicio, precio)
VALUES ('Anti-stress', 1),
('Descontracturantes', 1),
('Masajes con piedras calientes',  1),
('Circulatorios', 1),
('Lifting de pestaña', 1),
('Depilación facial', 1),
('Belleza de manos y pies', 1),
('Punta de Diamante: Microexfoliación',  1),
('Limpieza profunda + Hidratación',  1),
('Crio frecuencia facial: efecto lifting',  1),
('VelaSlim: Reducción corporal y celulitis',  1),
('DermoHealth: drenaje linfático',  1),
('Criofrecuencia: efecto lifting instantáneo',  1),
('Ultracavitación: Técnica reductora',  1);