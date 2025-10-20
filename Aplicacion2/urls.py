from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

# Namespace para evitar conflictos de nombres en {% url %}
app_name = "Aplicacion2"

urlpatterns = [
    # ============================================================
    # 🏠 PÁGINA INICIAL
    # ============================================================
    path("", views.bienvenida, name="bienvenida"),             # Pantalla inicial
    path("inicio/", views.inicio, name="inicio"),              # Página principal (dashboard)

    # ============================================================
    # 👤 AUTENTICACIÓN Y REGISTRO
    # ============================================================
    path("registro/padre/", views.registro_padre, name="registro_padre"),
    path("registro/propietario/", views.registro_propietario, name="registro_propietario"),

    path(
        "login/",
        auth_views.LoginView.as_view(template_name="Aplicacion2/login.html"),
        name="login",
    ),
    path("logout/", views.salir, name="salir"),

    # ============================================================
    # 🎮 SECCIONES PRINCIPALES (solo usuarios autorizados)
    # ============================================================
    path("juegos/", views.juegos, name="juegos"),                     # Página de juegos
    path("juegos/<int:juego_id>/", views.juego_detalle, name="juego_detalle"),
    path("juegos/crear/", views.crear_juego, name="crear_juego"),

    path("recursos/", views.recursos, name="recursos"),
    path("progreso/", views.progreso, name="progreso"),
    path("contacto/", views.contacto, name="contacto"),

    # ============================================================
    # 🧑‍💼 SECCIÓN EXCLUSIVA PARA PROPIETARIOS
    # ============================================================
    path("consultas/", views.consultas_propietario, name="consultas_propietario"),

    # ============================================================
    # 🚫 RESTRICCIONES Y GESTIÓN
    # ============================================================
    path("no-autorizado/", views.no_autorizado, name="no_autorizado"),
    path("gestion/juegos/", views.gestion_juegos, name="gestion_juegos"),
    path("gestion/juegos/<int:juego_id>/eliminar/", views.eliminar_juego, name="eliminar_juego"),

    # ============================================================
    # 🛒 E-COMMERCE (PRODUCTOS Y PEDIDOS)
    # ============================================================
    path("productos/", views.productos, name="productos"),
    path("productos/<int:producto_id>/", views.producto_detalle, name="producto_detalle"),
    path("carrito/", views.carrito, name="carrito"),
    path("pedido/confirmar/", views.confirmar_pedido, name="confirmar_pedido"),
    path("pedidos/", views.pedidos, name="pedidos"),

    # ============================================================
    # 📜 POLÍTICAS Y DOCUMENTOS LEGALES
    # ============================================================
    path("politica-privacidad/", views.politica_privacidad, name="politica_privacidad"),

    # ============================================================
    # 🎮 JUEGOS ESTÁTICOS Y DINÁMICOS
    # ============================================================
    # Catálogo visual (lista de todos los juegos)
    path("juegos/elegir/", views.elegir_juego, name="elegir_juego"),

    # ✅ Juego local: se carga desde static/juegos/<carpeta>/index.html
    path("juegos/ver/<str:carpeta>/", views.ver_juego, name="ver_juego"),

    # ✅ Juego del modelo (acceso con slug)
    path("juegos/<slug:slug>/", views.ver_juego, name="ver_juego_slug"),

    # ============================================================
    # 🧩 LISTADO Y DETALLE DE JUEGOS (base de datos)
    # ============================================================
    path("lista-juegos/", views.lista_juegos, name="lista_juegos"),
    path("detalle-juego/<slug:slug>/", views.detalle_juego, name="detalle_juego"),
    path("tienda/", views.tienda, name="tienda"),
    
    # 🎵 Audio de 15 minutos para música de fondo
    path("audio/relax/", views.audio_relax, name="audio_relax"),
]
