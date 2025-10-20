@echo off
REM === Activar entorno virtual ===
call .\.venv\Scripts\activate

REM === Abrir el navegador directamente en /admin ===
start "" http://127.0.0.1:9000/admin/

REM === Ejecutar el servidor Django en 127.0.0.1:9000 ===
python manage.py runserver 127.0.0.1:9000
