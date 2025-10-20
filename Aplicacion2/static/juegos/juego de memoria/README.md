# Juego de Memoria (Pares Clásico)

Versión clásica del juego de memoria: encuentra todas las parejas lo más rápido posible. No hay límite de intentos ni sistema de vidas; el objetivo es mejorar tu tiempo.

## Características
- Ingreso de nombre (requisito para jugar y ver rankings).
- Rankings por dificultad (Fácil 2x2, Medio 4x4, Difícil 6x6).
- Se guarda el mejor tiempo (menor) por jugador en cada dificultad (Top 10).
- Tableros con emojis variados mezclados aleatoriamente.
- Vista previa inicial de 2 segundos con todas las cartas descubiertas.
- Cronómetro hasta completar todas las parejas.
- Modal final con resultado y opciones de reinicio o cambio de dificultad.
- Persistencia local (`localStorage`).
- Botón protegido con clave (1595) para restablecer rankings.

## Dificultades
| Dificultad | Tamaño | Parejas |
|------------|--------|---------|
| Fácil      | 2x2    | 2       |
| Medio      | 4x4    | 8       |
| Difícil    | 6x6    | 18      |

## Flujo de juego
1. Ingresa tu nombre y presiona "Continuar".
2. Elige una dificultad.
3. Memoriza las cartas durante la vista previa inicial.
4. Da vuelta de a dos cartas buscando coincidencias.
5. Al encontrar todas las parejas se registra tu tiempo si mejora el anterior.

## Ranking
- Ordenado de menor a mayor tiempo.
- Si repites y mejoras tu marca, se actualiza.
- Se muestran los 10 mejores por dificultad.

## Personalización rápida
- Emojis: editar el arreglo `EMOJIS` en `script.js`.
- Agregar límite de tiempo: añadir lógica en `actualizarTimer()`.
- Cambiar tamaños: modificar `configDificultad`.

## Tecnologías
- HTML, CSS y JavaScript puro.
- Sin librerías externas.

## Ideas futuras
- Sonidos y efectos de partículas.
- Modo oscuro.
- Animaciones adicionales al acertar.

¡Diviértete y mejora tu memoria! 🧠✨
