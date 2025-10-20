@echo off
REM === Activar entorno virtual ===
call .\.venv\Scripts\activate

REM === Iniciar el servidor Django en una nueva ventana ===
start "Servidor Django" cmd /k "python manage.py runserver 0.0.0.0:9000"

REM === Esperar unos segundos a que el servidor arranque ===
timeout /t 5 /nobreak >nul

REM === Abrir el navegador en la URL correcta ===
start "" http://127.0.0.1:9000/
