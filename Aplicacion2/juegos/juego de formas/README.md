# Juego de Formas

Arrastra las figuras a su silueta correcta. Puedes elegir jugar con 1 a 10 figuras (Círculo, Cuadrado, Triángulo, Estrella, Paraguas, Pentágono, Hexágono, Semicírculo, Casa y Sol).

## Cómo jugar
1. Pantalla de bienvenida: pulsa "Pulse para iniciar".
2. Selecciona la cantidad de figuras (1–10) y pulsa "Comenzar".
3. Las figuras y sus siluetas aparecen dispersas aleatoriamente en sus zonas.
4. Arrastra una figura desde la zona de figuras hacia la zona de destino.
5. Si la sueltas exactamente sobre su silueta, queda colocada y aparece un ✓.
6. Si la sueltas dentro del tablero pero no en su silueta correcta, pierdes (puedes reintentar o volver al menú).
7. Si la sueltas fuera del tablero, vuelve a su posición original.
8. Completa todas para ganar.

## Tecnologías
- HTML5 + CSS3 (responsivo, flexbox)
- JavaScript (Pointer Events para soporte unificado mouse/touch). Regla de pérdida implementada al soltar incorrectamente dentro del tablero.

## Mejoras añadidas
- Sonidos generados con Web Audio al: encajar (secuencia ascendente), ganar (melodía corta) y perder (tono descendente).
- Animación de brillo y pop al colocar correctamente.

## Accesibilidad y mejoras posibles
- Se podría añadir navegación por teclado para seleccionar una figura y moverla con flechas.
- Sonidos al encajar y ganar.
- Temporizador y récords.

## Estructura principal
```
index.html
styles.css
script.js
README.md
```

## Licencia
Uso libre educativo.
