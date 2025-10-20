# Tablemico (Django)

Un proyecto Django listo para desarrollo local y despliegue en la nube.

## Requisitos
- Python 3.11+
- pip

## Ejecutar localmente (Windows PowerShell)
1. Crear y activar entorno virtual (si no existe):
   - py -m venv .venv
   - .\.venv\Scripts\Activate.ps1
2. Instalar dependencias:
   - pip install -r requirements.txt
3. Migraciones y arranque:
   - python manage.py migrate
   - python manage.py runserver 0.0.0.0:9000

La app quedará disponible en http://localhost:9000

## Variables de entorno
Copia `.env.example` a `.env` y ajusta valores:
- DJANGO_DEBUG
- DJANGO_ALLOWED_HOSTS
- DJANGO_SECRET_KEY (obligatorio en producción)
- DATABASE_URL (opcional para Postgres/MySQL en producción)
- EMAIL_* (credenciales SMTP si querés enviar correos)

## Despliegue (Render.com)
1. Subí el repo a GitHub.
2. En Render, crea un nuevo servicio Web desde el repo.
3. Aceptá los comandos por defecto de `render.yaml`.
4. Configurá variables de entorno: DJANGO_SECRET_KEY, DJANGO_ALLOWED_HOSTS y (opcional) DATABASE_URL.

Render ejecutará:
- pip install -r requirements.txt
- python manage.py collectstatic --noinput
- gunicorn Tablemico1.wsgi:application

## Despliegue (Heroku/Railway)
- Usá el `Procfile` incluido.
- Configurá variables de entorno equivalentes.

## Archivos estáticos y media
- WhiteNoise sirve `staticfiles` en producción.
- `collectstatic` debe correr en el build.
- Media se sirve desde `/media/` (para producción, usar almacenamiento externo si hace falta).

## Notas
- El proyecto usa Hotwire Turbo para mantener la música de fondo continua.
- El audio local de 15 minutos se copia automáticamente a `MEDIA/audio/relax-15m.mp3` al primer acceso.
