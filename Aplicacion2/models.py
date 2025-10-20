from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator, MinLengthValidator
from django.utils.text import slugify
from datetime import date
from django.urls import reverse

# ============================================================
# PERFIL DE USUARIO
# ============================================================
class Perfil(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="perfil")
    fecha_nacimiento = models.DateField(verbose_name="Fecha de nacimiento")
    es_tutor = models.BooleanField(default=True, help_text="Indica si es padre/tutor.")
    es_propietario = models.BooleanField(default=False, help_text="Indica si el usuario es propietario.")

    def edad(self):
        hoy = date.today()
        return hoy.year - self.fecha_nacimiento.year - (
            (hoy.month, hoy.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day)
        )

    def es_mayor_de_edad(self):
        return self.edad() >= 18

    def __str__(self):
        rol = "Propietario" if self.es_propietario else "Padre/Tutor"
        return f"{self.user.username} ({rol})"

    class Meta:
        verbose_name = "Perfil"
        verbose_name_plural = "Perfiles"


# ============================================================
# CATEGORÍAS (unificada para juegos y productos)
# ============================================================
class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True, verbose_name="Nombre de la categoría")
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    descripcion = models.TextField(blank=True, null=True, verbose_name="Descripción")
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nombre)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        ordering = ["nombre"]


# ============================================================
# JUEGOS
# ============================================================
class Juego(models.Model):
    categoria = models.ForeignKey(
        Categoria, on_delete=models.SET_NULL, null=True, blank=True, related_name="juegos"
    )
    titulo = models.CharField(max_length=100, verbose_name="Título", db_index=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    descripcion = models.TextField(verbose_name="Descripción")
    imagen = models.ImageField(upload_to="juegos/", blank=True, null=True, verbose_name="Imagen")
    archivo_html = models.CharField(
        max_length=200,
        verbose_name="Archivo HTML",
        help_text="Ruta dentro de static/, ej: juegos/juego_de_formas/index.html"
    )
    edad_recomendada = models.PositiveIntegerField(
        default=3,
        validators=[MinValueValidator(1), MaxValueValidator(18)],
        verbose_name="Edad recomendada"
    )
    creado_por = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Creado por"
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.titulo)
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse("Aplicacion2:juego_detalle", kwargs={"slug": self.slug})

    def ruta_estatica(self):
        return f"/static/{self.archivo_html}"

    def __str__(self):
        return self.titulo

    class Meta:
        verbose_name = "Juego"
        verbose_name_plural = "Juegos"
        ordering = ["-fecha_creacion"]


# ============================================================
# PROGRESO DE JUEGOS
# ============================================================
class Progreso(models.Model):
    perfil = models.ForeignKey(Perfil, on_delete=models.CASCADE, related_name="progresos")
    juego = models.ForeignKey(Juego, on_delete=models.CASCADE, related_name="progresos")
    puntaje = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.perfil.user.username} - {self.juego.titulo}: {self.puntaje} pts"

    class Meta:
        verbose_name = "Progreso"
        verbose_name_plural = "Progresos"
        ordering = ["-fecha"]
        constraints = [
            models.UniqueConstraint(fields=["perfil", "juego"], name="unique_progreso_perfil_juego")
        ]


# ============================================================
# PRODUCTOS
# ============================================================
class Producto(models.Model):
    categoria = models.ForeignKey(
        "Categoria",
        on_delete=models.CASCADE,
        related_name="productos",
        verbose_name="Categoría"
    )
    nombre = models.CharField(
        "Nombre del producto",
        max_length=150,
        db_index=True
    )
    slug = models.SlugField(
        "Slug",
        max_length=180,
        unique=True,
        blank=True
    )
    descripcion = models.TextField(
        "Descripción",
        blank=True,
        null=True
    )
    precio = models.DecimalField(
        "Precio",
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    stock = models.PositiveIntegerField(
        "Stock disponible",
        default=0
    )
    imagen = models.ImageField(
        "Imagen del producto",
        upload_to="productos/",
        blank=True,
        null=True
    )
    fecha_creacion = models.DateTimeField(
        "Fecha de creación",
        auto_now_add=True
    )
    activo = models.BooleanField(
        "Disponible para venta",
        default=True
    )
    destacado = models.BooleanField(
        "Producto destacado",
        default=False
    )

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        ordering = ["nombre"]

    def save(self, *args, **kwargs):
        """Genera automáticamente el slug basado en el nombre si no existe."""
        if not self.slug:
            base_slug = slugify(self.nombre)
            slug = base_slug
            contador = 1
            while Producto.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{contador}"
                contador += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        """Retorna la URL del detalle del producto."""
        return reverse("Aplicacion2:producto_detalle", kwargs={"slug": self.slug})

    def __str__(self):
        return f"{self.nombre} (${self.precio})"


# ============================================================
# PEDIDOS
# ============================================================
class Pedido(models.Model):
    ESTADOS = (
        ("pendiente", "Pendiente"),
        ("procesando", "Procesando"),
        ("enviado", "Enviado"),
        ("completado", "Completado"),
        ("cancelado", "Cancelado"),
    )

    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name="pedidos")
    productos = models.ManyToManyField("Producto", through="PedidoDetalle")
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, default="pendiente")
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def calcular_total(self):
        self.total = sum(detalle.subtotal() for detalle in self.detalles.all())
        self.save()

    def __str__(self):
        return f"Pedido #{self.id} - {self.usuario.username} ({self.estado})"

    class Meta:
        verbose_name = "Pedido"
        verbose_name_plural = "Pedidos"
        ordering = ["-fecha"]


# ============================================================
# DETALLE DE PEDIDOS
# ============================================================
class PedidoDetalle(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name="detalles")
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    def subtotal(self):
        return self.cantidad * self.precio_unitario

    def __str__(self):
        return f"{self.cantidad} x {self.producto.nombre} (Pedido #{self.pedido.id})"

    class Meta:
        verbose_name = "Detalle de pedido"
        verbose_name_plural = "Detalles de pedidos"
        constraints = [
            models.UniqueConstraint(fields=["pedido", "producto"], name="unique_producto_por_pedido")
        ]


# ============================================================
# CONSULTAS DE CONTACTO
# ============================================================
class Consulta(models.Model):
    nombre = models.CharField(max_length=100)
    email = models.EmailField()
    asunto = models.CharField(max_length=150)
    telefono = models.CharField(max_length=20, blank=True, null=True, validators=[MinLengthValidator(6)])
    mensaje = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.fecha.strftime('%d/%m/%Y %H:%M')}] {self.asunto} - {self.nombre}"

    class Meta:
        verbose_name = "Consulta"
        verbose_name_plural = "Consultas"
        ordering = ["-fecha"]
