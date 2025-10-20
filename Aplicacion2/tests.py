from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User, Group
from Aplicacion2.models import Juego
from Aplicacion2.forms import JuegoForm


class VistasPublicasTest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_bienvenida_carga(self):
        """La vista de bienvenida responde correctamente"""
        url = reverse("Aplicacion2:bienvenida")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Bienvenido")

    def test_inicio_carga(self):
        """La vista inicio responde correctamente"""
        url = reverse("Aplicacion2:inicio")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)


class AutenticacionTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username="usuario", password="12345")

    def test_login_correcto(self):
        login = self.client.login(username="usuario", password="12345")
        self.assertTrue(login)

    def test_login_incorrecto(self):
        login = self.client.login(username="usuario", password="incorrecto")
        self.assertFalse(login)

    def test_logout(self):
        self.client.login(username="usuario", password="12345")
        response = self.client.get(reverse("Aplicacion2:salir"))
        self.assertEqual(response.status_code, 302)  # Redirección tras logout


class GestionJuegosTest(TestCase):
    def setUp(self):
        # Creamos grupo propietario
        self.grupo_propietarios, _ = Group.objects.get_or_create(name="Propietarios")

        # Usuario propietario
        self.user = User.objects.create_user(username="propietario", password="12345")
        self.user.groups.add(self.grupo_propietarios)

        # Cliente autenticado
        self.client = Client()
        self.client.login(username="propietario", password="12345")

    def test_acceso_gestion_juegos(self):
        url = reverse("Aplicacion2:gestion_juegos")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_crear_juego(self):
        url = reverse("Aplicacion2:gestion_juegos")
        data = {"nombre": "Juego Test", "descripcion": "Un juego de prueba"}
        response = self.client.post(url, data, follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Juego.objects.filter(nombre="Juego Test").exists())

    def test_eliminar_juego(self):
        juego = Juego.objects.create(nombre="Juego a eliminar", descripcion="...", creado_por=self.user)
        url = reverse("Aplicacion2:eliminar_juego", args=[juego.id])
        response = self.client.post(url, follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Juego.objects.filter(id=juego.id).exists())


class FormularioJuegoTest(TestCase):
    def test_formulario_valido(self):
        form = JuegoForm(data={"nombre": "Juego válido", "descripcion": "Demo"})
        self.assertTrue(form.is_valid())

    def test_formulario_invalido(self):
        form = JuegoForm(data={})  # vacío
        self.assertFalse(form.is_valid())
