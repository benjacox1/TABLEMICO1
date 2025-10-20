from django.apps import AppConfig


class Aplicacion2Config(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Aplicacion2'
    verbose_name = "Aplicación Principal"  # Nombre más legible en el admin

    def ready(self):
        """
        Este método se ejecuta automáticamente cuando la aplicación se inicia.
        Se usa para importar señales (signals) y evitar importaciones circulares.
        """
        try:
            import Aplicacion2.signals  # noqa: F401
        except ImportError:
            # Si el módulo de señales no existe, simplemente se omite.
            pass
