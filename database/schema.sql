-- =====================================================
-- PELUQUERÍA SAAS - Schema MySQL
-- Importar en MySQL Workbench
-- =====================================================

CREATE DATABASE IF NOT EXISTS peluqueria_saas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE peluqueria_saas;

-- ---------------------------------------------------
-- Tabla: salones (cada peluquería registrada)
-- ---------------------------------------------------
CREATE TABLE salons (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(120)  NOT NULL,
  slug         VARCHAR(100)  NOT NULL UNIQUE,   -- para la URL pública: /reservar/mi-peluqueria
  address      VARCHAR(255),
  phone        VARCHAR(30),
  email        VARCHAR(120)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  logo_url     VARCHAR(255),
  cover_url    VARCHAR(255),                        -- imagen de portada del hero
  brand_color  VARCHAR(7)    DEFAULT '#7c3aed',     -- color corporativo (hex)
  description  TEXT,                               -- texto "sobre nosotros"
  instagram    VARCHAR(120),
  facebook     VARCHAR(120),
  whatsapp     VARCHAR(30),
  active       TINYINT(1)    DEFAULT 1,
  created_at   DATETIME      DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------
-- Tabla: servicios ofrecidos por cada salón
-- ---------------------------------------------------
CREATE TABLE services (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  salon_id         INT          NOT NULL,
  name             VARCHAR(100) NOT NULL,
  description      TEXT,
  duration_minutes INT          NOT NULL DEFAULT 30,
  price            DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  active           TINYINT(1)   DEFAULT 1,
  FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
);

-- ---------------------------------------------------
-- Tabla: empleados del salón
-- ---------------------------------------------------
CREATE TABLE staff (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  salon_id  INT          NOT NULL,
  name      VARCHAR(100) NOT NULL,
  role      VARCHAR(80)  DEFAULT 'Estilista',
  photo_url VARCHAR(255),
  active    TINYINT(1)   DEFAULT 1,
  FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
);

-- ---------------------------------------------------
-- Tabla: horarios de trabajo por empleado y día
-- ---------------------------------------------------
CREATE TABLE schedules (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  staff_id    INT         NOT NULL,
  day_of_week TINYINT     NOT NULL,  -- 0=Lun, 1=Mar, ..., 6=Dom
  start_time  TIME        NOT NULL,
  end_time    TIME        NOT NULL,
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- ---------------------------------------------------
-- Tabla: bloqueos manuales de horario (vacaciones, etc.)
-- ---------------------------------------------------
CREATE TABLE blocked_slots (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  staff_id   INT  NOT NULL,
  blocked_date DATE NOT NULL,
  start_time TIME,
  end_time   TIME,
  reason     VARCHAR(120),
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- ---------------------------------------------------
-- Tabla: citas / reservas
-- ---------------------------------------------------
CREATE TABLE appointments (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  salon_id       INT          NOT NULL,
  service_id     INT          NOT NULL,
  staff_id       INT,
  client_name    VARCHAR(120) NOT NULL,
  client_phone   VARCHAR(30),
  client_email   VARCHAR(120) NOT NULL,
  appt_date      DATE         NOT NULL,
  appt_time      TIME         NOT NULL,
  status         ENUM('pendiente','confirmada','cancelada','completada') DEFAULT 'pendiente',
  notes          TEXT,
  created_at     DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (salon_id)   REFERENCES salons(id)   ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id)   REFERENCES staff(id)    ON DELETE SET NULL
);

-- ---------------------------------------------------
-- Datos de ejemplo
-- ---------------------------------------------------
INSERT INTO salons (name, slug, address, phone, email, password_hash) VALUES
('Peluquería Marta', 'peluqueria-marta', 'Calle Mayor 12, Madrid', '600123456', 'marta@ejemplo.com', '$2b$10$examplehashMarta'),
('Estilo & Corte', 'estilo-y-corte', 'Av. del Sol 5, Barcelona', '612987654', 'admin@estilocorte.com', '$2b$10$examplehashEstilo');

INSERT INTO services (salon_id, name, description, duration_minutes, price) VALUES
(1, 'Corte de pelo', 'Corte clásico o moderno', 30, 18.00),
(1, 'Tinte completo', 'Coloración total con secado', 90, 55.00),
(1, 'Mechas', 'Mechas balayage o clásicas', 120, 75.00),
(1, 'Manicura', 'Manicura básica con esmalte', 45, 20.00),
(2, 'Corte caballero', 'Corte y perfilado de barba', 30, 15.00),
(2, 'Corte señora', 'Corte con lavado y secado', 60, 30.00),
(2, 'Peinado especial', 'Recogido o peinado para evento', 60, 40.00);

INSERT INTO staff (salon_id, name, role) VALUES
(1, 'Marta García', 'Propietaria/Estilista'),
(1, 'Laura Pérez', 'Estilista'),
(2, 'Carlos Ruiz', 'Barbero'),
(2, 'Ana Molina', 'Estilista');

INSERT INTO schedules (staff_id, day_of_week, start_time, end_time) VALUES
(1, 0, '09:00', '18:00'),(1, 1, '09:00', '18:00'),(1, 2, '09:00', '18:00'),
(1, 3, '09:00', '18:00'),(1, 4, '09:00', '18:00'),
(2, 0, '10:00', '19:00'),(2, 1, '10:00', '19:00'),(2, 2, '10:00', '19:00'),
(2, 3, '10:00', '19:00'),(2, 4, '10:00', '19:00'),
(3, 0, '09:00', '20:00'),(3, 1, '09:00', '20:00'),(3, 2, '09:00', '20:00'),
(3, 3, '09:00', '20:00'),(3, 4, '09:00', '20:00'),(3, 5, '10:00', '15:00'),
(4, 0, '10:00', '18:00'),(4, 1, '10:00', '18:00'),(4, 2, '10:00', '18:00'),
(4, 3, '10:00', '18:00'),(4, 4, '10:00', '18:00');
