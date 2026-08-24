"""
Convierte el datasheet de Excel de docta.vtg en el data/products.json
que usa la página.

Uso:
    pip install openpyxl --break-system-packages
    python3 excel_a_json.py docta_vtg_Pagina_Web.xlsx data/products.json

Columnas esperadas en el Excel (hoja 1, fila 1 = encabezados; el orden no importa):
    Id | Nombre | Talle | Largo | Ancho | Categoria | Subcategoria | Estado
    | Detalles | Disponible | Precio | Imagen | Descripcion

- "Categoria" es el tag genérico que se usa para FILTRAR (Abrigo, Pantalon,
  Remera, Accesorio).
- "Subcategoria" es libre (Buzo, Rompeviento, Polar, etc), NO se usa para
  filtrar, solo se muestra al lado del nombre de la prenda en el index.
- "Imagen" puede tener varios links, uno por línea (Alt+Enter dentro de la
  celda). Tienen que ser DIRECTOS (empiezan con https://i.ibb.co/...), no
  el link de la página de vista previa (https://ibb.co/...).
- "Talle" debería ser uno de: S, M, L, XL, XXL+ para que el filtro de la
  página lo pueda matchear. Si ponés otra cosa (ej "XL Amplio") se guarda
  igual, pero no lo va a encontrar el filtro por talle.
"""

import sys
import json
from datetime import datetime, date

import openpyxl

# Mapeo de categorías "libres" que puedas escribir en el Excel hacia las
# categorías fijas que usa el filtro de la página.
MAPEO_CATEGORIAS = {
    "buzo": "Abrigos",
    "buzos": "Abrigos",
    "campera": "Abrigos",
    "camperas": "Abrigos",
    "tapado": "Abrigos",
    "abrigo": "Abrigos",
    "abrigos": "Abrigos",
    "rompeviento": "Abrigos",
    "polar": "Abrigos",
    "pantalon": "Pantalones",
    "pantalones": "Pantalones",
    "jean": "Pantalones",
    "jeans": "Pantalones",
    "remera": "Remeras",
    "remeras": "Remeras",
    "camisa": "Remeras",
    "camisas": "Remeras",
    "accesorio": "Accesorios",
    "accesorios": "Accesorios",
}

TALLES_VALIDOS = {"S", "M", "L", "XL", "XXL+"}


def normalizar_categoria(valor):
    if not valor:
        return "Sin categoría"
    clave = str(valor).strip().lower()
    return MAPEO_CATEGORIAS.get(clave, str(valor).strip())


def normalizar_talle(valor, fila_num, avisos):
    if not valor:
        return None
    talle = str(valor).strip().upper()
    if talle not in TALLES_VALIDOS:
        avisos.append(
            f"  fila {fila_num}: el talle '{valor}' no es S/M/L/XL/XXL+, se guarda "
            f"igual pero el filtro de talle NO lo va a encontrar."
        )
    return talle


def parsear_imagenes(valor, fila_num, avisos):
    if not valor:
        return []
    links = [l.strip() for l in str(valor).splitlines() if l.strip()]
    for link in links:
        if "i.ibb.co" not in link and "ibb.co" in link:
            avisos.append(
                f"  fila {fila_num}: '{link}' parece un link de vista previa, no el link directo de la imagen. "
                f"Entrá a ese link en imgbb y copiá el que dice 'Direct links' (empieza con https://i.ibb.co/)."
            )
    return links


def valor_texto(valor, fila_num=None, columna=None, avisos=None):
    if valor is None:
        return ""
    if isinstance(valor, (datetime, date)):
        if avisos is not None:
            avisos.append(
                f"  fila {fila_num}: la columna '{columna}' se cargó como fecha ({valor.strftime('%d/%m/%Y')}) "
                f"en vez de texto. Si no era una fecha de verdad, en Excel poné un apóstrofe adelante "
                f"(ej: '10 / 10) para que no la autoconvierta."
            )
        return valor.strftime("%d/%m/%Y")
    return str(valor).strip()


def valor_numero(valor):
    if valor is None or valor == "":
        return None
    try:
        return float(valor)
    except (TypeError, ValueError):
        return None


def convertir(excel_path, json_path):
    wb = openpyxl.load_workbook(excel_path, data_only=True)
    ws = wb.active

    filas = list(ws.iter_rows(values_only=True))
    encabezados = [str(h).strip() if h else "" for h in filas[0]]
    idx = {nombre: i for i, nombre in enumerate(encabezados)}

    columnas_esperadas = ["Id", "Nombre", "Talle", "Largo", "Ancho", "Categoria",
                           "Subcategoria", "Estado", "Detalles", "Disponible",
                           "Precio", "Imagen", "Descripcion"]
    faltantes = [c for c in columnas_esperadas if c not in idx]
    if faltantes:
        print(f"AVISO: no encontré estas columnas en el Excel: {', '.join(faltantes)}")

    productos = []
    avisos = []

    for n, fila in enumerate(filas[1:], start=2):
        if not fila or fila[idx.get("Id", 0)] is None:
            continue

        def get(col):
            i = idx.get(col)
            return fila[i] if i is not None and i < len(fila) else None

        if not get("Nombre"):
            continue

        imagenes = parsear_imagenes(get("Imagen"), n, avisos)

        producto = {
            "id": valor_texto(get("Id")),
            "titulo": valor_texto(get("Nombre")),
            "categoria": normalizar_categoria(get("Categoria")),
            "subcategoria": valor_texto(get("Subcategoria")),
            "talle": normalizar_talle(get("Talle"), n, avisos),
            "largo": valor_numero(get("Largo")),
            "ancho": valor_numero(get("Ancho")),
            "estado": valor_texto(get("Estado"), n, "Estado", avisos),
            "detalles": valor_texto(get("Detalles")),
            "disponible": valor_texto(get("Disponible")).lower() in ("si", "sí", "true", "1"),
            "precio": get("Precio"),
            "imagenes": imagenes,
            "imagen": imagenes[0] if imagenes else "",
            "descripcion": valor_texto(get("Descripcion")),
        }
        productos.append(producto)

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(productos, f, ensure_ascii=False, indent=2)

    print(f"Listo: {len(productos)} prenda(s) escritas en {json_path}")
    if avisos:
        print("\nRevisá esto antes de subir:")
        for a in avisos:
            print(a)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: python3 excel_a_json.py <excel_entrada.xlsx> <products.json_salida>")
        sys.exit(1)
    convertir(sys.argv[1], sys.argv[2])
