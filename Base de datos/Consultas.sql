USE Proyecto_Tablemico;

SELECT j.id_juego, j.nombre AS juego, c.nombre AS categoria, j.precio, j.stock, j.plataforma
FROM juegos j
LEFT JOIN categorias c ON j.id_categoria = c.id_categoria
ORDER BY c.nombre, j.nombre;

SELECT nombre, stock
FROM juegos
WHERE stock < 5
ORDER BY stock ASC;

SELECT v.id_venta, v.fecha, c.nombre AS cliente, j.nombre AS juego, dv.cantidad, dv.precio_unitario, v.total
FROM ventas v
JOIN clientes c ON v.id_cliente = c.id_cliente
JOIN detalle_ventas dv ON v.id_venta = dv.id_venta
JOIN juegos j ON dv.id_juego = j.id_juego
ORDER BY v.fecha DESC;


SELECT c.nombre AS cliente, COUNT(v.id_venta) AS cantidad_compras, SUM(v.total) AS total_gastado
FROM ventas v
JOIN clientes c ON v.id_cliente = c.id_cliente
GROUP BY c.id_cliente
ORDER BY total_gastado DESC;


SELECT j.nombre AS juego, SUM(dv.cantidad) AS cantidad_vendida, SUM(dv.cantidad * dv.precio_unitario) AS ingresos
FROM detalle_ventas dv
JOIN juegos j ON dv.id_juego = j.id_juego
GROUP BY j.id_juego
ORDER BY cantidad_vendida DESC
LIMIT 5;

SELECT SUM(total) AS ingresos_mensuales
FROM ventas
WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH);


SELECT j.nombre, j.stock
FROM juegos j
LEFT JOIN detalle_ventas dv ON j.id_juego = dv.id_juego
WHERE dv.id_juego IS NULL;






