# Tutorial: subir docta.vtg a internet con Git + Vercel

Esta guía asume que estás arrancando de cero con Git y GitHub. Son muchos pasos
pero cada uno es simple — hacelos en orden.

---

## Parte 0 — Qué necesitás antes de empezar

- Una cuenta de **GitHub** (gratis) → [github.com/join](https://github.com/join)
- **Git** instalado en tu compu
- Una cuenta de **Vercel** (gratis, la vas a crear con tu cuenta de GitHub)

---

## Parte 1 — Instalar Git

Abrí una terminal y escribí:

```
git --version
```

- Si te muestra un número de versión, ya lo tenés instalado, pasá a la Parte 2.
- Si no lo reconoce:
  - **Windows**: descargá el instalador desde [git-scm.com/download/win](https://git-scm.com/download/win), lo instalás con las opciones por defecto (siguiente, siguiente, siguiente).
  - **Mac**: abrí la Terminal y escribí `git --version` — macOS te va a ofrecer instalar las "herramientas de línea de comandos" automáticamente, aceptá.

Cerrá y volvé a abrir la terminal después de instalar, para que reconozca el comando.

---

## Parte 2 — Configurar Git con tu nombre y mail (una sola vez)

En la terminal:

```
git config --global user.name "Tu Nombre"
git config --global user.email "tu-mail@ejemplo.com"
```

Usá el mismo mail con el que te registraste en GitHub.

---

## Parte 3 — Crear el repositorio en GitHub

1. Entrá a [github.com](https://github.com) con tu cuenta.
2. Arriba a la derecha, tocá el **+** → **New repository**.
3. Repository name: `docta-vtg`.
4. Dejalo en **Public** (o Private si preferís, ambos funcionan igual con Vercel).
5. **No** marques "Add a README" ni ".gitignore" — la carpeta que ya tenés arma eso.
6. Tocá **Create repository**.
7. GitHub te va a mostrar una URL parecida a:
   `https://github.com/tu-usuario/docta-vtg.git`
   — copiala, la vas a necesitar en la Parte 5.

---

## Parte 4 — Preparar tu carpeta local

Asegurate de tener todos estos archivos juntos en una sola carpeta (por ejemplo `docta-vtg/`), tal cual te los fui pasando:

```
docta-vtg/
├── index.html
├── producto.html
├── styles.css
├── script.js
├── producto.js
├── README.md
├── data/
│   └── products.json
└── scripts/
    └── excel_a_json.py
```

Si algún archivo te quedó en Descargas suelto, movelo adentro de esta carpeta antes de seguir.

---

## Parte 5 — Subir la carpeta a GitHub

Abrí una terminal **parada dentro de esa carpeta** (en Windows: click derecho dentro de la carpeta → "Abrir en Terminal"; en Mac: arrastrá la carpeta al ícono de Terminal, o `cd` hasta ahí).

Ejecutá, uno por uno:

```
git init
```
Convierte la carpeta en un repositorio de Git.

```
git add .
```
Prepara todos los archivos para el primer commit.

```
git commit -m "primera version de docta.vtg"
```
Guarda ese "punto en el tiempo" del proyecto.

```
git branch -M main
```
Nombra la rama principal `main` (estándar actual de GitHub).

```
git remote add origin https://github.com/tu-usuario/docta-vtg.git
```
Conecta tu carpeta local con el repositorio que creaste en GitHub (usá la URL que copiaste en la Parte 3).

```
git push -u origin main
```
Sube todo. Te va a pedir que inicies sesión en GitHub (se abre el navegador, o te pide usuario/token la primera vez) — seguí las instrucciones en pantalla.

Cuando termina, refrescá la página de tu repo en GitHub: ya deberías ver todos tus archivos ahí.

---

## Parte 6 — Conectar Vercel

1. Entrá a [vercel.com](https://vercel.com) y tocá **Sign Up**.
2. Elegí **Continue with GitHub** (así quedan conectados automáticamente).
3. Una vez adentro, tocá **Add New...** → **Project**.
4. Vercel te va a mostrar tus repos de GitHub — buscá `docta-vtg` y tocá **Import**.
5. En la pantalla de configuración:
   - **Framework Preset**: dejalo en `Other`.
   - **Build Command**: dejalo vacío (no hace falta, es un sitio estático).
   - **Output Directory**: dejalo en `.` (la raíz).
6. Tocá **Deploy**.

Esperá unos segundos — Vercel va a copiar tus archivos y ponerlos online. Cuando termina te muestra un botón para visitar el sitio, con una URL tipo `docta-vtg.vercel.app`.

**Esa URL ya es tu página funcionando de verdad en internet**, con fetch, filtros, y la página de detalle de producto andando como corresponde (a diferencia de la preview local, acá sí hay un servidor real atrás).

---

## Parte 7 — Cómo actualizar el sitio de ahí en adelante

Cada vez que quieras subir prendas nuevas o cambiar algo:

1. Actualizás tu Excel y corrés el conversor como ya vimos:
   ```
   python3 scripts/excel_a_json.py docta_vtg_Pagina_Web.xlsx data/products.json
   ```
2. Desde la terminal, parado en la carpeta del proyecto:
   ```
   git add .
   git commit -m "agrego prendas nuevas"
   git push
   ```
3. Listo. Vercel detecta el `push` automáticamente y redeploya el sitio solo, en menos de un minuto — no hay que volver a tocar nada en Vercel.

---

## Parte 8 (opcional) — Dominio propio docta.vtg

Por ahora vas a tener `docta-vtg.vercel.app`. Si más adelante querés que la gente entre directo con `docta.vtg` (o `.com`, `.com.ar`, etc — depende de qué dominio compres), hay que:

1. Comprar el dominio en un registrador (ej. Namecheap, GoDaddy, NIC Argentina para `.com.ar`).
2. En Vercel: Project → Settings → Domains → agregar el dominio.
3. Vercel te da unos registros DNS para cargar en el panel del registrador donde compraste el dominio.

Esto lo vemos con calma más adelante, no hace falta ahora para tener el sitio online y funcionando.
