from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Perfil,
    Juego,
    Progreso,
    Categoria,
    Producto,
    Pedido,
    PedidoDetalle,
    Consulta,
)

# ============================================================
# CONFIGURACIÓN GLOBAL DEL ADMIN
# ============================================================
admin.site.site_header = "Panel de Administración - Tablemico"
admin.site.site_title = "Tablemico Admin"
admin.site.index_title = "Bienvenido al Panel de Gestión"


# ============================================================
# PERFIL DE USUARIO
# ============================================================
@admin.register(Perfil)
class PerfilAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "email",
        "fecha_nacimiento",
        "es_tutor",
        "es_propietario",
        "fecha_registro",
    )
    search_fields = ("user__username", "user__email")
    list_filter = ("es_tutor", "es_propietario", "fecha_nacimiento")
    ordering = ("user__username",)
    list_per_page = 25
    autocomplete_fields = ("user",)
    readonly_fields = ("fecha_registro",)

    @admin.display(ordering="user__email", description="Correo")
    def email(self, obj):
        return obj.user.email

    @admin.display(description="Registrado el")
    def fecha_registro(self, obj):
        return obj.user.date_joined


# ============================================================
# JUEGOS
# ============================================================
@admin.register(Juego)
class JuegoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "titulo",
        "edad_recomendada",
        "creado_por",
        "fecha_creacion",
        "usuarios_jugaron",
    )
    search_fields = ("titulo", "descripcion")
    list_filter = ("edad_recomendada", "fecha_creacion")
    ordering = ("titulo",)
    autocomplete_fields = ("creado_por",)
    list_per_page = 25
    date_hierarchy = "fecha_creacion"

    @admin.display(description="Usuarios jugaron")
    def usuarios_jugaron(self, obj):
        return obj.progreso_set.count()


# ============================================================
# PROGRESO
# ============================================================
@admin.register(Progreso)
class ProgresoAdmin(admin.ModelAdmin):
    list_display = ("id", "perfil", "juego", "puntaje", "fecha", "nivel_color")
    search_fields = ("perfil__user__username", "juego__titulo")
    list_filter = ("fecha", "puntaje")
    ordering = ("-fecha",)
    list_per_page = 25
    date_hierarchy = "fecha"

    @admin.display(description="Rendimiento")
    def nivel_color(self, obj):
        if obj.puntaje is None:
            return format_html('<span style="color:gray;">N/A</span>')
        if obj.puntaje >= 80:
            color = "green"
        elif obj.puntaje >= 50:
            color = "orange"
        else:
            color = "red"
        return format_html('<b style="color:{};">{}%</b>', color, obj.puntaje)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("perfil__user", "juego")


# ============================================================
# CATEGORÍAS
# ============================================================
@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre", "descripcion", "fecha_creacion", "total_productos")
    search_fields = ("nombre",)
    ordering = ("nombre",)
    list_per_page = 25
    date_hierarchy = "fecha_creacion"

    @admin.display(description="Nº Productos")
    def total_productos(self, obj):
        return obj.productos.count()  # Usa related_name de Producto


# ============================================================
# PRODUCTOS
# ============================================================
@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "nombre",
        "categoria",
        "precio",
        "stock",
        "activo",
        "destacado",
        "thumbnail",
        "stock_bajo",
    )
    search_fields = ("nombre", "descripcion")
    list_filter = ("categoria", "activo", "destacado")
    ordering = ("nombre",)
    list_editable = ("stock", "activo", "destacado")
    autocomplete_fields = ("categoria",)
    list_per_page = 25

    fieldsets = (
        ("Información básica", {"fields": ("nombre", "categoria", "precio", "stock", "activo", "destacado")}),
        ("Detalles", {"fields": ("descripcion", "imagen"), "classes": ("collapse",)}),
    )

    @admin.display(description="Imagen")
    def thumbnail(self, obj):
        if obj.imagen:
            return format_html('<img src="{}" style="height:40px; border-radius:6px;" />', obj.imagen.url)
        return "-"

    @admin.display(boolean=True, description="Stock bajo")
    def stock_bajo(self, obj):
        return obj.stock < 5


# ============================================================
# DETALLES DE PEDIDOS
# ============================================================
class PedidoDetalleInline(admin.TabularInline):
    model = PedidoDetalle
    extra = 0
    autocomplete_fields = ("producto",)
    readonly_fields = ("precio_unitario", "subtotal")

    @admin.display(description="Subtotal")
    def subtotal(self, obj):
        if obj.cantidad and obj.precio_unitario:
            return f"${obj.cantidad * obj.precio_unitario:.2f}"
        return "$0.00"


@admin.register(PedidoDetalle)
class PedidoDetalleAdmin(admin.ModelAdmin):
    list_display = ("id", "pedido_id_display", "producto", "cantidad", "precio_unitario", "subtotal")
    search_fields = ("producto__nombre",)
    ordering = ("-pedido",)
    list_per_page = 25

    @admin.display(ordering="pedido", description="Pedido ID")
    def pedido_id_display(self, obj):
        return obj.pedido.id

    @admin.display(description="Subtotal")
    def subtotal(self, obj):
        if obj.cantidad and obj.precio_unitario:
            return f"${obj.cantidad * obj.precio_unitario:.2f}"
        return "$0.00"


# ============================================================
# PEDIDOS
# ============================================================
@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ("id", "usuario", "fecha", "estado_coloreado", "total", "detalles_link")
    search_fields = ("usuario__username", "id")
    list_filter = ("estado", "fecha")
    ordering = ("-fecha",)
    inlines = [PedidoDetalleInline]
    readonly_fields = ("fecha", "total")
    list_per_page = 25
    date_hierarchy = "fecha"

    fieldsets = (
        ("Información del pedido", {"fields": ("usuario", "fecha", "estado")}),
        ("Totales", {"fields": ("total",)}),
    )

    @admin.display(description="Estado")
    def estado_coloreado(self, obj):
        colores = {
            "pendiente": "orange",
            "procesando": "purple",
            "enviado": "blue",
            "completado": "green",
            "cancelado": "red",
        }
        color = colores.get(obj.estado, "black")
        return format_html('<b style="color:{};">{}</b>', color, obj.estado.title())

    @admin.display(description="Detalles")
    def detalles_link(self, obj):
        return format_html(
            '<a href="{}">Ver detalles</a>',
            f"/admin/Aplicacion2/pedidodetalle/?pedido__id={obj.id}"
        )

    @admin.action(description="Marcar pedidos como enviados")
    def marcar_enviados(self, _request, queryset):
        queryset.update(estado="enviado")

    actions = ["marcar_enviados"]

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("usuario").prefetch_related("pedidodetalle_set__producto")


# ============================================================
# CONSULTAS DE CONTACTO
# ============================================================
@admin.register(Consulta)
class ConsultaAdmin(admin.ModelAdmin):
    list_display = ("nombre", "email", "asunto", "telefono", "fecha", "responder_link")
    search_fields = ("nombre", "email", "asunto")
    list_filter = ("fecha",)
    ordering = ("-fecha",)
    list_per_page = 25
    date_hierarchy = "fecha"
    readonly_fields = ("nombre", "email", "asunto", "telefono", "mensaje", "fecha")

    @admin.display(description="Responder")
    def responder_link(self, obj):
        return format_html(
            '<a href="mailto:{}?subject=Re:%20{}">Responder</a>',
            obj.email,
            obj.asunto
        )
