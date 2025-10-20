from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Perfil
from django.core.exceptions import ValidationError


@receiver(post_save, sender=User)
def crear_o_guardar_perfil(sender, instance, created, **kwargs):
    """Crea automáticamente un perfil cuando se crea un usuario y lo actualiza en cambios posteriores."""
    if created:
        Perfil.objects.create(user=instance)
    else:
        # Si ya existe, lo guardamos para mantener sincronizado
        if hasattr(instance, "perfil"):
            instance.perfil.save()


@receiver(post_save, sender=Perfil)
def verificar_edad(sender, instance, **kwargs):
    """Verifica que el usuario sea mayor de edad antes de guardar el perfil."""
    if instance.fecha_nacimiento:
        if not instance.es_mayor_de_edad():
            # ValidationError es mejor que ValueError (se integra con formularios)
            raise ValidationError("Solo se permiten usuarios mayores de 18 años.")
