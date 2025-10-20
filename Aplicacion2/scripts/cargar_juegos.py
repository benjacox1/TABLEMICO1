from Aplicacion2.models import Juego
from django.contrib.auth import get_user_model

def run():
    """
    Script para cargar juegos educativos en la base de datos.
    Ejecutar con:
        python manage.py runscript cargar_juegos
    """

    User = get_user_model()
    usuario = User.objects.first()  # Toma el primer usuario (por ejemplo, admin)

    if not usuario:
        print("❌ No existe ningún usuario. Creá uno primero con 'python manage.py createsuperuser'.")
        return

    juegos = [
        {
            "titulo": "Juego de Formas",
            "descripcion": "Identifica y clasifica figuras geométricas según su forma y color.",
            "imagen": "juegos/formas.jpg",
            "archivo_html": "juegos/juego de formas/index.html",
        },
        {
            "titulo": "Juego de Memoria",
            "descripcion": "Encuentra las parejas iguales para ejercitar la memoria visual.",
            "imagen": "juegos/memoria.jpg",
            "archivo_html": "juegos/juego de memoria/index.html",
        },
        {
            "titulo": "No Salir de la Línea",
            "descripcion": "Sigue la línea con precisión sin salirte del camino.",
            "imagen": "juegos/linea.jpg",
            "archivo_html": "juegos/juego de no salir de la linea/index.html",
        },
        {
            "titulo": "Tirar el Cubo",
            "descripcion": "Lanza el cubo para aprender los números de manera divertida.",
            "imagen": "juegos/cubo.jpg",
            "archivo_html": "juegos/juego tirar el cubo/index.html",
        },
    ]

    print("🚀 Cargando juegos educativos...\n")

    for data in juegos:
        data["creado_por"] = usuario
        juego, creado = Juego.objects.get_or_create(
            titulo=data["titulo"],
            defaults=data
        )
        if creado:
            print(f"✅ Juego agregado: {juego.titulo}")
        else:
            # Si ya existía, actualizamos datos por si cambió algo
            for campo, valor in data.items():
                setattr(juego, campo, valor)
            juego.save()
            print(f"🔄 Juego actualizado: {juego.titulo}")

    print("\n🎮 Carga completada.")
