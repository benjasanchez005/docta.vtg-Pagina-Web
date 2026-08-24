# docta.vtg

Sitio estático (HTML/CSS/JS puro, sin frameworks) para el catálogo de ropa vintage.

## Estructura
```
index.html          página principal
styles.css           estilos (negro + violeta oscuro)
script.js             carga el catálogo y maneja el filtro
data/products.json    catálogo de prendas (esto es lo que vas a reemplazar con tu excel)
```

## Cómo cargar tus prendas reales

**No se edita `products.json` a mano.** Se carga todo en el Excel
(`docta_vtg_Pagina_Web.xlsx`) y se corre el conversor:

```
python3 scripts/excel_a_json.py docta_vtg_Pagina_Web.xlsx data/products.json
```

Esto lee el Excel completo y regenera `products.json` de cero. Columnas del
Excel: Id, Nombre, Talle, Largo, Ancho, Categoria, Subcategoria, Estado,
Detalles, Disponible, Precio, Imagen, Descripcion.

- `Categoria` es el tag genérico que se usa para **filtrar** en la sidebar
  (se mapea automáticamente a Abrigos, Pantalones, Remeras o Accesorios).
- `Subcategoria` es libre (Buzo, Rompeviento, Polar, etc). No se filtra,
  solo se muestra al lado del nombre de la prenda en el index.
- `Talle` tiene que ser S, M, L, XL o XXL+ para que el filtro de talle la
  encuentre.
- `Imagen` puede tener varios links, uno por línea dentro de la celda
  (Alt+Enter). Tienen que ser los links DIRECTOS de imgbb
  (`https://i.ibb.co/...`), no el de la página de vista previa.

El script avisa por consola si algo quedó mal cargado (talle inválido,
fecha donde no correspondía, link de vista previa en vez de directo).

## Deploy en Vercel

1. Subí esta carpeta a un repo de GitHub/GitLab.
2. En Vercel: "Add New Project" → importá el repo.
3. Como es un sitio estático, no hace falta ningún build command ni framework preset: dejalo en "Other" y el output directory en la raíz (`.`).
4. Deploy. Cada vez que actualices `data/products.json` en el repo, Vercel va a redeployar solo.
