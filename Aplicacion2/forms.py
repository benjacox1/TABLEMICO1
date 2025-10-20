from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.core.exceptions import ValidationError
from datetime import date
from .models import Perfil, Juego


# ======================================================
# VALIDACIONES PERSONALIZADAS
# ======================================================

def validar_fecha_nacimiento(fecha):
    """Valida que la fecha de nacimiento sea lógica."""
    if fecha > date.today():
        raise ValidationError("La fecha de nacimiento no puede ser en el futuro.")
    edad = (date.today() - fecha).days // 365
    if edad < 3:
        raise ValidationError("El usuario debe tener al menos 3 años.")
    return fecha


def validar_email_unico(email):
    """Valida que el email no esté registrado."""
    if User.objects.filter(email=email).exists():
        raise ValidationError("Este email ya está registrado.")
    return email


# ======================================================
# FORMULARIO: REGISTRO PADRE / TUTOR
# ======================================================
class RegistroPadreForm(UserCreationForm):
    fecha_nacimiento = forms.DateField(
        label="Fecha de nacimiento",
        widget=forms.DateInput(attrs={
            "type": "date",
            "class": "form-control"
        }),
        validators=[validar_fecha_nacimiento]
    )
    email = forms.EmailField(
        label="Correo electrónico",
        widget=forms.EmailInput(attrs={
            "class": "form-control",
            "placeholder": "ejemplo@correo.com"
        }),
        validators=[validar_email_unico]
    )

    class Meta:
        model = User
        fields = ["username", "email", "password1", "password2"]
        widgets = {
            "username": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "Nombre de usuario"
            }),
            "password1": forms.PasswordInput(attrs={
                "class": "form-control",
                "placeholder": "Contraseña"
            }),
            "password2": forms.PasswordInput(attrs={
                "class": "form-control",
                "placeholder": "Repite la contraseña"
            }),
        }
        labels = {
            "username": "Nombre de usuario",
            "password1": "Contraseña",
            "password2": "Confirmar contraseña"
        }

    def save(self, commit=True):
        """Crea el usuario y su perfil como tutor/padre."""
        user = super().save(commit=commit)
        Perfil.objects.create(
            user=user,
            fecha_nacimiento=self.cleaned_data["fecha_nacimiento"],
            es_tutor=True,
            es_propietario=False,
        )
        return user


# ======================================================
# FORMULARIO: REGISTRO PROPIETARIO
# ======================================================
class RegistroPropietarioForm(UserCreationForm):
    fecha_nacimiento = forms.DateField(
        label="Fecha de nacimiento",
        widget=forms.DateInput(attrs={
            "type": "date",
            "class": "form-control"
        }),
        validators=[validar_fecha_nacimiento]
    )
    email = forms.EmailField(
        label="Correo electrónico",
        widget=forms.EmailInput(attrs={
            "class": "form-control",
            "placeholder": "ejemplo@correo.com"
        }),
        validators=[validar_email_unico]
    )
    clave_secreta = forms.CharField(
        label="Clave de propietario",
        widget=forms.PasswordInput(attrs={
            "class": "form-control",
            "placeholder": "Clave secreta"
        }),
        help_text="Introduce la clave proporcionada para propietarios."
    )

    CLAVE_PROPIETARIO = "supersecreto123"  # ⚠️ Mueve esto a settings.py para mayor seguridad

    class Meta:
        model = User
        fields = ["username", "email", "password1", "password2"]
        widgets = {
            "username": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "Nombre de usuario"
            }),
            "password1": forms.PasswordInput(attrs={
                "class": "form-control",
                "placeholder": "Contraseña"
            }),
            "password2": forms.PasswordInput(attrs={
                "class": "form-control",
                "placeholder": "Repite la contraseña"
            }),
        }

    def clean_clave_secreta(self):
        clave = self.cleaned_data.get("clave_secreta")
        if clave != self.CLAVE_PROPIETARIO:
            raise forms.ValidationError("Clave secreta incorrecta.")
        return clave

    def save(self, commit=True):
        """Crea el usuario y su perfil como propietario."""
        user = super().save(commit=commit)
        Perfil.objects.create(
            user=user,
            fecha_nacimiento=self.cleaned_data["fecha_nacimiento"],
            es_tutor=False,
            es_propietario=True,
        )
        return user


# ======================================================
# FORMULARIO: CREAR / EDITAR JUEGO
# ======================================================
class JuegoForm(forms.ModelForm):
    class Meta:
        model = Juego
        fields = ["titulo", "descripcion", "edad_recomendada"]
        widgets = {
            "titulo": forms.TextInput(attrs={
                "class": "form-control",
                "placeholder": "Título del juego"
            }),
            "descripcion": forms.Textarea(attrs={
                "class": "form-control",
                "rows": 4,
                "placeholder": "Describe el objetivo y las instrucciones del juego"
            }),
            "edad_recomendada": forms.NumberInput(attrs={
                "class": "form-control",
                "min": 3,
                "max": 18
            }),
        }
        labels = {
            "titulo": "Título del juego",
            "descripcion": "Descripción",
            "edad_recomendada": "Edad recomendada",
        }

    def clean_edad_recomendada(self):
        edad = self.cleaned_data.get("edad_recomendada")
        if edad < 3 or edad > 18:
            raise forms.ValidationError("La edad recomendada debe estar entre 3 y 18 años.")
        return edad
