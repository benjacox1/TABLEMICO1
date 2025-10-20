from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth import login, logout
from django.contrib import messages
from django.urls import reverse_lazy
from django.core.paginator import Paginator
from django.templatetags.static import static
from django.http import HttpResponse, Http404, FileResponse
from django.conf import settings
from django.core.mail import send_mail

import os
import shutil
import logging

from .forms import RegistroPadreForm, RegistroPropietarioForm, JuegoForm
from .models import Juego, Progreso, Pedido, Producto, Consulta

# ============================================================
# CONFIGURACIÓN DE LOGGING
# ============================================================
logger = logging.getLogger(__name__)

# ============================================================
# FUNCIONES AUXILIARES
# ============================================================

def es_admin(user):
    """Verifica si el usuario es superusuario (admin)."""
    return user.is_superuser


def solo_propietarios(user):
    """Verifica que el usuario sea propietario."""
    perfil = getattr(user, "perfil", None)
    return bool(perfil and getattr(perfil, "es_propietario", False))


def obtener_perfil_usuario(user):
    """Obtiene el perfil de usuario y maneja si no existe."""
    return getattr(user, "perfil", None)


# ============================================================
# VISTAS PÚBLICAS
# ============================================================

def bienvenida(request):
    return render(request, "Aplicacion2/bienvenida.html")


def inicio(request):
    """
    Página principal de Juegos Motrices.
    Muestra juegos destacados, productos destacados
    y opciones según el usuario autenticado.
    """
    # 🕹️ Cargar hasta 4 juegos destacados
    juegos = Juego.objects.all()[:4]

    # 🛍️ Cargar hasta 4 productos destacados (o todos si no hay filtro)
    productos = Producto.objects.filter(destacado=True)[:4] if hasattr(Producto, 'destacado') else Producto.objects.all()[:4]

    context = {
        'juegos': juegos,
        'productos': productos
    }

    return render(request, "Aplicacion2/inicio.html", context)


def productos(request):
    """Lista paginada de productos disponibles."""
    lista = Producto.objects.all()
    paginator = Paginator(lista, 10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    return render(request, "Aplicacion2/productos/list.html", {"productos": page_obj})


def producto_detalle(request, producto_id):
    producto = get_object_or_404(Producto, id=producto_id)
    return render(request, "Aplicacion2/productos/detail.html", {"producto": producto})


def carrito(request):
    return render(request, "Aplicacion2/carrito.html")


def contacto(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        subject = request.POST.get('subject')
        phone = request.POST.get('phone')
        message = request.POST.get('message')

        mensaje_completo = f"""
        Nueva consulta desde Tablemico:

        Nombre: {name}
        Email: {email}
        Teléfono: {phone}
        Asunto: {subject}

        Mensaje:
        {message}
        """

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                ["jbrandan847@gmail.com"],  # correo de destino
            )
            messages.success(request, "¡Tu consulta fue enviada con éxito!")
        except Exception as e:
            messages.error(request, f"Error al enviar la consulta: {e}")

        return redirect('Aplicacion2:contacto')

    return render(request, 'Aplicacion2/contacto.html')

def confirmar_pedido(request):
    if request.method == "POST":
        messages.success(request, "Tu pedido fue confirmado correctamente.")
        return redirect("Aplicacion2:inicio")
    return render(request, "Aplicacion2/confirmar_pedido.html")


def no_autorizado(request):
    return render(request, "Aplicacion2/no_autorizado.html")


def salir(request):
    logout(request)
    messages.info(request, "Has cerrado sesión correctamente.")
    return redirect("Aplicacion2:bienvenida")


# ============================================================
# VISTAS DE JUEGOS (DINÁMICOS Y ESTÁTICOS)
# ============================================================

def juegos(request):
    """
    Lista combinada de juegos:
    - Juegos creados en la base de datos.
    - Juegos estáticos almacenados en /static/juegos/.
    """
    juegos_bd = list(Juego.objects.all())
    juegos_static = [
        {
            "nombre": "Juego de Formas",
            "descripcion": "Identifica y clasifica figuras geométricas.",
            "imagen": "/static/img/juegos/formas.jpg",
            "carpeta": "juego-de-formas",
        },
        {
            "nombre": "Juego de Memoria",
            "descripcion": "Encuentra las parejas iguales.",
            "imagen": "/static/img/juegos/memoria.jpg",
            "carpeta": "juego-de-memoria",
        },
        {
            "nombre": "No Salir de la Línea",
            "descripcion": "Sigue la línea sin salirte del camino.",
            "imagen": "/static/img/juegos/linea.jpg",
            "carpeta": "juego no salir de la linea",
        },
        {
            "nombre": "Tirar el Cubo",
            "descripcion": "Lanza el cubo y aprende los números.",
            "imagen": "/static/img/juegos/cubo.jpg",
            "carpeta": "juego-tirar-el-cubo",
        },
    ]

    juegos_combinados = juegos_bd + juegos_static
    return render(request, "Aplicacion2/juegos.html", {"juegos": juegos_combinados})


@login_required
def ver_juego(request, carpeta):
    """
    Carga un juego estático desde /static/juegos/<carpeta>/index.html
    o muestra el HTML de un juego guardado en base de datos.
    """
    # 1️⃣ Si es un juego de base de datos (por ID numérico)
    if carpeta.isdigit():
        juego = get_object_or_404(Juego, id=int(carpeta))
        ruta = static(juego.archivo_html)
        return render(request, "Aplicacion2/ver_juego.html", {
            "nombre": getattr(juego, "titulo", juego.nombre),
            "ruta": ruta
        })

    # 2️⃣ Manejar nombres de carpeta con espacios o guiones
    carpeta_real = carpeta.replace("-", " ")

    # 3️⃣ Buscar archivo dentro de /Aplicacion2/static/juegos/<carpeta>/index.html
    ruta_absoluta = os.path.join(
        settings.BASE_DIR, "Aplicacion2", "static", "juegos", carpeta_real, "index.html"
    )
    print("🔍 Buscando juego en:", ruta_absoluta)

    if not os.path.exists(ruta_absoluta):
        raise Http404(f"No se encontró el juego '{carpeta_real}' en /static/juegos/")

    # 4️⃣ Generar la ruta que usará el navegador
    ruta_relativa = f"/static/juegos/{carpeta_real}/index.html"

    # 5️⃣ Renderizar plantilla con el iframe o el contenido
    return render(request, "Aplicacion2/ver_juego.html", {
        "ruta": ruta_relativa,
        "nombre": carpeta_real.capitalize()
    })



@login_required
def juego_detalle(request, juego_id):
    perfil = obtener_perfil_usuario(request.user)
    if not perfil or not perfil.es_mayor_de_edad():
        return redirect("Aplicacion2:no_autorizado")

    juego = get_object_or_404(Juego, id=juego_id)
    return render(request, "Aplicacion2/juego_detalle.html", {"juego": juego})


# ============================================================
# LISTA DE JUEGOS ESTÁTICOS Y DETALLE
# ============================================================

def lista_juegos(request):
    """Lista los juegos disponibles dentro de /static/juegos/"""
    ruta_juegos = os.path.join(settings.BASE_DIR, "Aplicacion2", "static", "juegos")
    juegos = []

    if os.path.exists(ruta_juegos):
        for carpeta in os.listdir(ruta_juegos):
            ruta_index = os.path.join(ruta_juegos, carpeta, "index.html")
            if os.path.exists(ruta_index):
                juegos.append({
                    "nombre": carpeta.replace("-", " ").capitalize(),
                    "slug": carpeta,
                    "imagen": f"/static/juegos/{carpeta}/imagen.jpg"
                })

    return render(request, "Aplicacion2/lista_juegos.html", {"juegos": juegos})


def detalle_juego(request, slug):
    """Muestra el detalle de un juego estático desde /static/juegos/<slug>/index.html"""
    ruta_html = os.path.join(settings.BASE_DIR, "Aplicacion2", "static", "juegos", slug, "index.html")

    if not os.path.exists(ruta_html):
        raise Http404("Juego no encontrado.")

    ruta_web = f"/static/juegos/{slug}/index.html"
    return render(request, "Aplicacion2/detalle_juego.html", {
        "ruta": ruta_web,
        "nombre": slug.replace("-", " ").capitalize()
    })


# ============================================================
# RECURSOS Y PROGRESO
# ============================================================

@login_required
def recursos(request):
    perfil = obtener_perfil_usuario(request.user)
    if not perfil or not perfil.es_mayor_de_edad():
        return redirect("Aplicacion2:no_autorizado")
    return render(request, "Aplicacion2/recursos.html")


@login_required
def progreso(request):
    perfil = obtener_perfil_usuario(request.user)
    if not perfil:
        return redirect("Aplicacion2:no_autorizado")
    progresos = Progreso.objects.filter(perfil=perfil).select_related("juego")
    return render(request, "Aplicacion2/progreso.html", {"progresos": progresos})


# ============================================================
# REGISTRO DE USUARIOS
# ============================================================

def registro_padre(request):
    if request.method == "POST":
        form = RegistroPadreForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, "Cuenta creada correctamente.")
            return redirect("Aplicacion2:inicio")
        messages.error(request, "Por favor corrige los errores del formulario.")
    else:
        form = RegistroPadreForm()
    return render(request, "Aplicacion2/registro_padre.html", {"form": form})


@user_passes_test(es_admin)
def registro_propietario(request):
    if request.method == "POST":
        form = RegistroPropietarioForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_staff = True
            user.save()
            messages.success(request, "Propietario creado correctamente.")
            return redirect(reverse_lazy("admin:index"))
        messages.error(request, "Por favor corrige los errores del formulario.")
    else:
        form = RegistroPropietarioForm()
    return render(request, "Aplicacion2/registro_propietario.html", {"form": form})


# ============================================================
# GESTIÓN DE JUEGOS
# ============================================================

@login_required
@user_passes_test(solo_propietarios)
def gestion_juegos(request):
    """Permite al propietario crear y administrar juegos."""
    if request.method == "POST":
        form = JuegoForm(request.POST)
        if form.is_valid():
            nuevo_juego = form.save(commit=False)
            nuevo_juego.creado_por = request.user
            nuevo_juego.save()
            messages.success(request, "Juego agregado correctamente.")
            return redirect("Aplicacion2:gestion_juegos")
        messages.error(request, "Corrige los errores del formulario.")
    else:
        form = JuegoForm()

    queryset = Juego.objects.all().select_related("creado_por")
    paginator = Paginator(queryset, 10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)

    return render(request, "Aplicacion2/gestion_juegos.html", {
        "form": form,
        "juegos": page_obj
    })


@login_required
@user_passes_test(solo_propietarios)
def eliminar_juego(request, juego_id):
    """Permite eliminar un juego de la base de datos."""
    juego = get_object_or_404(Juego, id=juego_id)
    juego.delete()
    messages.success(request, "Juego eliminado correctamente.")
    return redirect("Aplicacion2:gestion_juegos")


# ============================================================
# PEDIDOS Y CONSULTAS
# ============================================================

@login_required
def pedidos(request):
    perfil = obtener_perfil_usuario(request.user)
    if not perfil:
        return redirect("Aplicacion2:no_autorizado")

    queryset = Pedido.objects.filter(perfil=perfil).prefetch_related("detalles").order_by("-fecha")
    paginator = Paginator(queryset, 10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    return render(request, "Aplicacion2/pedidos.html", {"pedidos": page_obj})


@login_required
@user_passes_test(solo_propietarios)
def consultas_propietario(request):
    consultas = Consulta.objects.all().order_by("-fecha")
    paginator = Paginator(consultas, 10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    return render(request, "Aplicacion2/consultas/consultas_propietario.html", {"consultas": page_obj})


# ============================================================
# PÁGINAS INFORMATIVAS
# ============================================================

def politica_privacidad(request):
    return render(request, "Aplicacion2/politica_privacidad.html")


def crear_juego(request):
    """Página para crear un nuevo juego (placeholder)."""
    return render(request, "Aplicacion2/crear_juego.html")


@login_required
def elegir_juego(request):
    """Permite al usuario elegir un juego de la lista."""
    juegos_disponibles = [
        {"nombre": "Juego de Formas", "slug": "juego-de-formas"},
        {"nombre": "Juego de Memoria", "slug": "juego-de-memoria"},
        {"nombre": "No Salir de la Línea", "slug": "juego no salir de la linea"},
        {"nombre": "Tirar el Cubo", "slug": "juego-tirar-el-cubo"},
    ]
    return render(request, "Aplicacion2/elegir_juego.html", {"juegos": juegos_disponibles})

def tienda(request):
    """
    🛍️ Página de Tienda Motriz — muestra todos los productos físicos.
    Permite añadir al carrito, vaciarlo y calcular el total.
    """
    productos = Producto.objects.all().order_by('-id')  # más recientes primero

    context = {
        'productos': productos
    }
    return render(request, "Aplicacion2/tienda.html", context)


# ============================================================
# AUDIO DE FONDO (SERVIR MP3 LOCAL)
# ============================================================
def audio_relax(request):
    """Entrega el audio de 15 minutos para música de fondo desde MEDIA.
    - Si no existe en MEDIA/audio/relax-15m.mp3, intenta copiarlo desde la raíz del proyecto.
    """
    media_dir = os.path.join(settings.MEDIA_ROOT, "audio")
    os.makedirs(media_dir, exist_ok=True)
    media_filename = "relax-15m.mp3"
    media_path = os.path.join(media_dir, media_filename)

    if not os.path.exists(media_path):
        # Intentar localizar el archivo original en la raíz del proyecto
        candidates = [
            os.path.join(settings.BASE_DIR, "15 Minute Meditation Music, Calm Music, Relax, Meditation, Stress Relief, Spa, Study, Sleep, 3527B.mp3"),
        ]
        # Buscar cualquier .mp3 en BASE_DIR si el nombre exacto no existe
        if not os.path.exists(candidates[0]):
            for name in os.listdir(settings.BASE_DIR):
                if name.lower().endswith(".mp3"):
                    candidates.append(os.path.join(settings.BASE_DIR, name))
        src = next((p for p in candidates if os.path.exists(p)), None)
        if not src:
            raise Http404("Archivo de audio no encontrado. Coloca el MP3 en la raíz o en MEDIA/audio/.")
        try:
            shutil.copyfile(src, media_path)
        except Exception as e:
            # Si no se puede copiar, servir directamente desde el origen
            response = FileResponse(open(src, "rb"), content_type="audio/mpeg")
            response["Content-Disposition"] = f"inline; filename=\"{os.path.basename(src)}\""
            return response

    response = FileResponse(open(media_path, "rb"), content_type="audio/mpeg")
    response["Content-Disposition"] = f"inline; filename=\"{media_filename}\""
    return response