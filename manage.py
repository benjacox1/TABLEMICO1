#!/usr/bin/env python
"""
manage.py - Punto de entrada principal para tareas administrativas en Django.

Uso común:
    python manage.py runserver         # Inicia el servidor en localhost:8000
    python manage.py runserver 0.0.0.0 # Inicia el servidor accesible en red
    python manage.py makemigrations    # Genera migraciones
    python manage.py migrate           # Aplica migraciones
    python manage.py createsuperuser   # Crea usuario administrador

Este script también carga automáticamente las variables de entorno definidas en .env
(si tenés instalado 'python-dotenv').
"""

import os
import sys


def load_dotenv():
    """
    Carga las variables de entorno desde el archivo .env si está instalado python-dotenv.
    """
    try:
        from dotenv import load_dotenv
        load_dotenv()  # Lee el archivo .env en la raíz del proyecto
    except ImportError:
        # Si python-dotenv no está instalado, simplemente continúa
        pass


def main():
    """Ejecuta las tareas administrativas de Django."""
    # Cargar variables de entorno
    load_dotenv()

    # Definir el módulo de configuración de Django
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Tablemico1.settings")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        print("⚠️  No se pudo importar Django.")
        print("Verifica que el entorno virtual esté activado y que Django esté instalado:")
        print("   source venv/bin/activate   (Linux/Mac)")
        print("   venv\\Scripts\\activate    (Windows)")
        print("   pip install django")
        raise exc

    # Si no se pasaron argumentos, mostrar la ayuda
    if len(sys.argv) == 1:
        sys.argv.append("--help")

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
