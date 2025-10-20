USE Proyecto_Tablemico;
-- ======================================
-- DATOS DE EJEMPLO PARA CATEGORÍAS
-- ======================================
INSERT INTO categorias (nombre, descripcion) VALUES
('Acción', 'Juegos de acción y aventura'),
('Deportes', 'Juegos de fútbol, básquet, carreras y más'),
('Estrategia', 'Juegos de estrategia en tiempo real o por turnos'),
('RPG', 'Juegos de rol y aventuras'),
('Carreras', 'Juegos de autos y motos'),
('Multijugador', 'Juegos online multijugador competitivos');

-- ======================================
-- DATOS DE EJEMPLO PARA JUEGOS
-- ======================================
INSERT INTO juegos (nombre, descripcion, precio, stock, plataforma, id_categoria, imagen_url) VALUES
('FIFA 25', 'Juego de fútbol más popular', 59.99, 20, 'PlayStation 5', 2, 'fifa25.jpg'),
('Call of Duty: Modern Warfare III', 'Shooter en primera persona', 69.99, 10, 'PC', 1, 'codmw3.jpg'),
('Age of Empires IV', 'Estrategia en tiempo real', 49.99, 15, 'PC', 3, 'aoe4.jpg'),
('Elden Ring', 'Juego de rol en mundo abierto', 79.99, 8, 'PC', 4, 'eldenring.jpg'),
('Gran Turismo 7', 'Simulación de carreras realista', 59.99, 5, 'PlayStation 5', 5, 'granturismo7.jpg'),
('Minecraft', 'Juego de construcción y supervivencia', 29.99, 30, 'PC', 6, 'minecraft.jpg'),
('NBA 2K25', 'Simulador de baloncesto', 59.99, 12, 'Xbox Series X', 2, 'nba2k25.jpg'),
('Mario Kart 8 Deluxe', 'Carreras divertidas con Mario y amigos', 49.99, 7, 'Nintendo Switch', 5, 'mariokart8.jpg'),
('The Legend of Zelda: Tears of the Kingdom', 'Aventura y exploración en mundo abierto', 69.99, 6, 'Nintendo Switch', 4, 'zelda_totk.jpg'),
('Valorant', 'Shooter táctico multijugador', 0.00, 50, 'PC', 6, 'valorant.jpg');

-- ======================================
-- DATOS DE EJEMPLO PARA CLIENTES
-- ======================================
INSERT INTO clientes (nombre, email, telefono, direccion) VALUES
('Juan Pérez', 'juanperez@gmail.com', '1123456789', 'Calle Falsa 123, Buenos Aires'),
('Ana López', 'analopez@gmail.com', '1134567890', 'Av. San Martín 456, Córdoba'),
('Carlos Gómez', 'carlosgomez@gmail.com', '1145678901', 'Ruta 8 Km 12, Mendoza');

-- ======================================
-- DATOS DE EJEMPLO PARA VENTAS
-- ======================================
INSERT INTO ventas (id_cliente, total) VALUES
(1, 129.98), -- Juan compró 2 juegos
(2, 69.99),  -- Ana compró 1 juego
(3, 79.99);  -- Carlos compró 1 juego

-- ======================================
-- DETALLE DE LAS VENTAS
-- (Venta 1 - Juan)
INSERT INTO detalle_ventas (id_venta, id_juego, cantidad, precio_unitario) VALUES
(1, 1, 1, 59.99),  -- FIFA 25
(1, 2, 1, 69.99);  -- Call of Duty MW3

-- (Venta 2 - Ana)
INSERT INTO detalle_ventas (id_venta, id_juego, cantidad, precio_unitario) VALUES
(2, 4, 1, 69.99);  -- Elden Ring

-- (Venta 3 - Carlos)
INSERT INTO detalle_ventas (id_venta, id_juego, cantidad, precio_unitario) VALUES
(3, 5, 1, 79.99);  -- Gran Turismo 7
