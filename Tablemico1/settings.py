"""
Configuración principal de Django para el proyecto Tablemico1.
Versión Django: 5.2.6
"""

from pathlib import Path
import os
import pymysql
import dj_database_url
from django.core.exceptions import ImproperlyConfigured

# ==============================
# 🔧 CONECTOR MYSQL
# ==============================
pymysql.install_as_MySQLdb()

# ==============================
# 📁 RUTAS BASE DEL PROYECTO
# ==============================
BASE_DIR = Path(__file__).resolve().parent.parent

# ==============================
# ⚙️ CONFIGURACIÓN BÁSICA
# ==============================
DEBUG = os.getenv("DJANGO_DEBUG", "True").lower() == "true"
ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS", "127.0.0.1,localhost").split(",")

# Clave secreta: usar desde variable de entorno en producción
SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "dev-secret-key-change-me" if DEBUG else None,
)
if not DEBUG and not SECRET_KEY:
    raise ImproperlyConfigured(
        "DJANGO_SECRET_KEY is required in production (DEBUG=False)."
    )

# ==============================
# 🧩 APLICACIONES INSTALADAS
# ==============================
INSTALLED_APPS = [
    # Tema admin
    "jazzmin",

    # Core de Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Librerías externas
    "widget_tweaks",
    "django_extensions",

    # Aplicaciones propias
    "Aplicacion2.apps.Aplicacion2Config",
]

# ==============================
# 🎨 CONFIGURACIÓN JAZZMIN (Panel Admin personalizado)
# ==============================
JAZZMIN_SETTINGS = {
    "site_title": "Tablemico Admin",
    "site_header": "Tablemico - Panel de Administración",
    "site_logo": "img/logo.jpg",
    "welcome_sign": "Bienvenido al Panel de Gestión Tablemico",
    "search_model": "Aplicacion2.Juego",
    "topmenu_links": [{"name": "Ir al sitio", "url": "/", "new_window": False}],
    "show_sidebar": True,
}

# ==============================
# 🧱 MIDDLEWARE
# ==============================
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ==============================
# 🔗 URLS Y WSGI
# ==============================
ROOT_URLCONF = "Tablemico1.urls"
WSGI_APPLICATION = "Tablemico1.wsgi.application"

# ==============================
# 🧩 TEMPLATES
# ==============================
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "Aplicacion2" / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ==============================
# 🗄️ BASE DE DATOS (SQLite - Temporal)
# ==============================
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Permitir usar DATABASE_URL (Postgres/MySQL) en despliegue
if os.getenv("DATABASE_URL"):
    DATABASES["default"] = dj_database_url.parse(os.getenv("DATABASE_URL"), conn_max_age=600)

# Base de datos MySQL (comentada temporalmente)
# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.mysql",
#         "NAME": "Proyecto_Tablemico",
#         "USER": "root",
#         "PASSWORD": "",  # ⚠️ Completar si tu MySQL tiene contraseña
#         "HOST": "127.0.0.1",
#         "PORT": "3306",
#         "OPTIONS": {
#             "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
#         },
#     }
# }

# ==============================
# 🔐 VALIDADORES DE CONTRASEÑA
# ==============================
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ==============================
# 🌎 CONFIGURACIÓN REGIONAL
# ==============================
LANGUAGE_CODE = "es"
TIME_ZONE = "America/Argentina/Buenos_Aires"
USE_I18N = True
USE_TZ = True

# ==============================
# 🖼️ ARCHIVOS ESTÁTICOS
# ==============================
STATIC_URL = "/static/"
STATICFILES_DIRS = [BASE_DIR / "Aplicacion2" / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ==============================
# 📸 ARCHIVOS MEDIA
# ==============================
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ==============================
# 🎮 CONFIGURACIÓN DE JUEGOS
# ==============================
JUEGOS_DIR = BASE_DIR / "Aplicacion2" / "juegos"

# ==============================
# 🔑 LOGIN / LOGOUT
# ==============================
LOGIN_REDIRECT_URL = "/inicio/"
LOGIN_URL = "/login/"
LOGOUT_REDIRECT_URL = "/"

# ==============================
# ✉️ CONFIGURACIÓN DE CORREO
# ==============================
# Variables de entorno recomendadas para producción
EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend"
)
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True").lower() == "true"
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", EMAIL_HOST_USER or "webmaster@localhost")

# En desarrollo, usar backend de consola si no hay credenciales
if DEBUG and not EMAIL_HOST_USER:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# ==============================
# ⚙️ CONFIGURACIÓN FINAL
# ==============================
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ==============================
# 🔒 SEGURIDAD EN PRODUCCIÓN
# ==============================
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = "DENY"
