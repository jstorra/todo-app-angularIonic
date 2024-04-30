DROP DATABASE IF EXISTS tododb;
CREATE DATABASE tododb;
USE tododb;

CREATE TABLE usuarios(
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    usuario VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    contraseña VARCHAR(100) NOT NULL
);

CREATE TABLE tareas(
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    descripcion TEXT NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado ENUM('por hacer','en progreso','terminado') NOT NULL DEFAULT 'por hacer',
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

CREATE TABLE auditoria_tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_tarea INT NOT NULL,
    estado_anterior ENUM('por hacer','en progreso','terminado') NOT NULL,
    estado_nuevo ENUM('por hacer','en progreso','terminado') NOT NULL,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tarea) REFERENCES tareas(id)
);

DELIMITER //

CREATE TRIGGER auditar_cambio_estado
AFTER UPDATE ON tareas
FOR EACH ROW
BEGIN
    IF OLD.estado != NEW.estado THEN
        INSERT INTO auditoria_tareas (id_tarea, estado_anterior, estado_nuevo, fecha_cambio)
        VALUES (OLD.id, OLD.estado, NEW.estado, NOW());
    END IF;
END;
//

DELIMITER ;