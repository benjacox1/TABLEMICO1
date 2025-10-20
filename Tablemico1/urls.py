"""
URL configuration for Tablemico1 project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ============================================================
    # ADMINISTRACIÓN
    # ============================================================
    path("admin/", admin.site.urls),

    # ============================================================
    # APLICACIONES
    # ============================================================
    path("", include(("Aplicacion2.urls", "Aplicacion2"), namespace="Aplicacion2")),

    # ============================================================
    # AUTENTICACIÓN DJANGO (login, logout, reset password, etc.)
    # ============================================================
    path("accounts/", include("django.contrib.auth.urls")),
]

# ============================================================
# CONFIGURACIÓN DE ARCHIVOS ESTÁTICOS Y MEDIA (SOLO EN DEBUG)
# ============================================================
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
