"""
Script de datos de ejemplo (seed) para InfraTrack.

Crea personal de obra, maquinaria pesada y capturas de campo geolocalizadas
para que el dashboard, el mapa y los reportes tengan información realista.

Uso:
    cd backend
    python seed.py            # inserta datos demo (no duplica)
    python seed.py --reset    # borra censos/maquinaria/personal demo y reinserta

Credenciales de acceso generadas (contraseña en texto plano):
    Gerente   -> usuario: carlos.gerente   contraseña: infratrack123
    Residente -> usuario: laura.residente  contraseña: infratrack123
    (todos los usuarios comparten la contraseña demo "infratrack123")

Nota sobre contraseñas: el frontend envía SHA-256(contraseña) y el backend
guarda bcrypt(SHA-256(contraseña)). Aquí replicamos exactamente ese flujo.
"""

import sys
import uuid
import random
import hashlib

from app.database import Base, engine, SessionLocal
from app.models.persona import Persona
from app.models.mascota import Mascota, TipoMascota
from app.models.censo import Censo
from app.security import hash_password

# Contraseña demo compartida por todos los usuarios sembrados.
DEMO_PASSWORD = "infratrack123"

# Colores por tipo de maquinaria (se usan para los marcadores del mapa).
COLOR_POR_TIPO = {
    TipoMascota.PERRO: "#F97316",   # Excavadora  -> naranja (marca)
    TipoMascota.GATO: "#2563EB",    # Bulldozer   -> azul
    TipoMascota.PAJARO: "#16A34A",  # Volqueta    -> verde
    TipoMascota.OTRO: "#64748B",    # Otro equipo -> gris
}

# Frentes de obra (proyectos) con su centro geográfico aproximado en Colombia.
PROYECTOS = [
    {"id": "FRENTE-NORTE-01", "centro": (4.7510, -74.0460)},   # Bogotá norte
    {"id": "FRENTE-SUR-02", "centro": (4.5709, -74.1300)},     # Bogotá sur
    {"id": "VIA-CALI-03", "centro": (3.4516, -76.5320)},       # Cali
    {"id": "PUERTO-MED-04", "centro": (6.2442, -75.5812)},     # Medellín
]


def _demo_password_hash() -> str:
    """Replica el flujo del frontend: bcrypt(SHA-256(contraseña))."""
    sha256_hex = hashlib.sha256(DEMO_PASSWORD.encode("utf-8")).hexdigest()
    return hash_password(sha256_hex)


# ── Datos base ────────────────────────────────────────────────
PERSONAL = [
    # nombres, apellidos, tipo_doc, documento, direccion, telefono, ciudad, usuario
    ("Carlos", "Ramírez Soto", "CC", "1010203040", "Calle 100 # 15-20", "3001112233", "Bogotá", "carlos.gerente"),
    ("Laura", "Gómez Díaz", "CC", "1020304050", "Carrera 7 # 45-12", "3002223344", "Bogotá", "laura.residente"),
    ("Andrés", "Patiño Ruiz", "CC", "1030405060", "Av. 68 # 30-15", "3003334455", "Bogotá", "andres.operador"),
    ("Marcela", "Torres León", "CC", "1040506070", "Calle 26 # 50-40", "3004445566", "Cali", "marcela.residente"),
    ("Julián", "Castro Vega", "CE", "1050607080", "Carrera 50 # 10-22", "3005556677", "Medellín", "julian.operador"),
    ("Diana", "Ospina Cruz", "CC", "1060708090", "Calle 80 # 20-18", "3006667788", "Bogotá", "diana.residente"),
    ("Felipe", "Moreno Ríos", "CC", "1070809010", "Carrera 15 # 70-05", "3007778899", "Medellín", "felipe.operador"),
    ("Sandra", "Núñez Pardo", "CC", "1080901020", "Av. Sexta # 25-33", "3008889900", "Cali", "sandra.operador"),
]

MAQUINARIA = [
    # nombre, tipo, estado(genero), edad(años)
    ("CAT 320 GC", TipoMascota.PERRO, "OPERATIVA", 3.0),
    ("Komatsu PC210", TipoMascota.PERRO, "OPERATIVA", 5.0),
    ("Hyundai R220", TipoMascota.PERRO, "MANTENIMIENTO", 7.0),
    ("CAT D6", TipoMascota.GATO, "OPERATIVA", 4.0),
    ("Komatsu D65", TipoMascota.GATO, "OPERATIVA", 6.0),
    ("John Deere 850K", TipoMascota.GATO, "MANTENIMIENTO", 8.0),
    ("Volvo FMX 440", TipoMascota.PAJARO, "OPERATIVA", 2.0),
    ("Kenworth T800", TipoMascota.PAJARO, "OPERATIVA", 5.0),
    ("Mack Granite", TipoMascota.PAJARO, "OPERATIVA", 6.0),
    ("Compactador CAT CS54", TipoMascota.OTRO, "OPERATIVA", 3.0),
    ("Motoniveladora CAT 120", TipoMascota.OTRO, "MANTENIMIENTO", 9.0),
    ("Grúa Liebherr LTM", TipoMascota.OTRO, "OPERATIVA", 4.0),
]


def _coord_cercana(centro: tuple[float, float]) -> tuple[float, float]:
    """Genera una coordenada con un pequeño desfase aleatorio (~1-2 km)."""
    lat, lon = centro
    return (
        round(lat + random.uniform(-0.012, 0.012), 6),
        round(lon + random.uniform(-0.012, 0.012), 6),
    )


def seed(reset: bool = False) -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if reset:
            print("Reset: eliminando censos, maquinaria y personal demo...")
            db.query(Censo).delete()
            # Solo borra el personal demo (por usuario conocido) y toda la maquinaria.
            usuarios_demo = [p[7] for p in PERSONAL]
            db.query(Persona).filter(Persona.usuario.in_(usuarios_demo)).delete(
                synchronize_session=False
            )
            db.query(Mascota).delete()
            db.commit()

        # Si ya hay censos, no volvemos a sembrar (evita duplicados).
        if not reset and db.query(Censo).count() > 0:
            print("Ya existen censos en la base de datos. Usa --reset para reiniciar.")
            return

        pwd_hash = _demo_password_hash()

        # ── Personal ──────────────────────────────────────────
        personas: list[Persona] = []
        for (nombres, apellidos, tipo_doc, doc, direccion, tel, ciudad, usuario) in PERSONAL:
            existente = db.query(Persona).filter(Persona.documento == doc).first()
            if existente:
                personas.append(existente)
                continue
            p = Persona(
                id=uuid.uuid4(),
                nombres=nombres,
                apellidos=apellidos,
                tipo_documento=tipo_doc,
                documento=doc,
                direccion=direccion,
                telefono=tel,
                ciudad=ciudad,
                usuario=usuario,
                contrasena=pwd_hash,
            )
            db.add(p)
            personas.append(p)
        db.commit()

        # ── Maquinaria ────────────────────────────────────────
        maquinas: list[Mascota] = []
        for (nombre, tipo, estado, edad) in MAQUINARIA:
            m = Mascota(
                id=uuid.uuid4(),
                nombre=nombre,
                tipo=tipo,
                genero=estado,
                edad=edad,
                fotografia=None,
            )
            db.add(m)
            maquinas.append(m)
        db.commit()

        # ── Censos (capturas de campo geolocalizadas) ─────────
        total_censos = 0
        for proyecto in PROYECTOS:
            # Cada frente tiene entre 5 y 8 capturas.
            for _ in range(random.randint(5, 8)):
                maquina = random.choice(maquinas)
                persona = random.choice(personas)
                lat, lon = _coord_cercana(proyecto["centro"])
                censo = Censo(
                    id=uuid.uuid4(),
                    id_mascota=maquina.id,
                    id_dueno=persona.id,
                    fotografia=None,
                    lat=lat,
                    lon=lon,
                    id_proyecto=proyecto["id"],
                    color=COLOR_POR_TIPO[maquina.tipo],
                )
                db.add(censo)
                total_censos += 1
        db.commit()

        print("Seed completado:")
        print(f"  Personal:   {len(personas)}")
        print(f"  Maquinaria: {len(maquinas)}")
        print(f"  Censos:     {total_censos}")
        print(f"  Frentes:    {len(PROYECTOS)}")
        print("\nCredenciales demo (contraseña: infratrack123):")
        print("  Gerente   -> carlos.gerente")
        print("  Residente -> laura.residente")
    finally:
        db.close()


if __name__ == "__main__":
    seed(reset="--reset" in sys.argv)
