# TABLEMICO1
Página web para venta de juegos interactivos.

## Proyecto (Django)

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
Botón de despliegue:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

Pasos rápidos:
1. Haz clic en el botón “Deploy to Render”.
2. Selecciona tu repo (benjacox1/TABLEMICO1) y confirma.
3. Variables de entorno sugeridas:
   - DJANGO_DEBUG=False
   - DJANGO_ALLOWED_HOSTS=tu-servicio.onrender.com
   - DJANGO_SECRET_KEY=(autogenerada)
   - DATABASE_URL=(opcional si usás Postgres gestionado)

Con `render.yaml`, Render ejecutará:
- pip install -r requirements.txt
- python manage.py migrate
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
