const grid = document.getElementById('grid');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const filterToggle = document.getElementById('filterToggle');
const filterClose = document.getElementById('filterClose');
const clearFiltersBtn = document.getElementById('clearFilters');
const resultCount = document.getElementById('resultCount');
const cardTemplate = document.getElementById('cardTemplate');

let products = [];

// --- carga de datos ---
// Este JSON hoy tiene datos de ejemplo. Cuando reemplaces el archivo
// data/products.json (generado a partir del Excel), cada fila debe tener:
// { id, titulo, categoria, talle, imagen }  -> "imagen" es el link de img.bb
fetch('data/products.json')
  .then(res => res.json())
  .then(data => {
    products = data;
    render();
  })
  .catch(err => {
    grid.innerHTML = '<p class="grid__empty">no se pudieron cargar las prendas.</p>';
    console.error(err);
  });

function getActiveFilters(name){
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(el => el.value);
}

function render(){
  const talles = getActiveFilters('talle');
  const categorias = getActiveFilters('categoria');

  const filtered = products.filter(p => {
    const okTalle = talles.length === 0 || talles.includes(p.talle);
    const okCategoria = categorias.length === 0 || categorias.includes(p.categoria);
    return okTalle && okCategoria;
  });

  resultCount.textContent = filtered.length;
  grid.innerHTML = '';

  if (filtered.length === 0){
    grid.innerHTML = '<p class="grid__empty">no hay prendas con esos filtros.</p>';
    return;
  }

  filtered.forEach(p => {
    const node = cardTemplate.content.cloneNode(true);
    const link = node.querySelector('.card');
    link.href = `producto.html?id=${encodeURIComponent(p.id)}`;
    const img = node.querySelector('.card__img');
    img.src = p.imagen;
    img.alt = p.titulo;
    node.querySelector('.card__talle').textContent = p.talle;
    node.querySelector('.card__title').textContent = p.titulo;
    node.querySelector('.card__meta').textContent = p.subcategoria || p.categoria;
    grid.appendChild(node);
  });
}

document.querySelectorAll('input[type="checkbox"]').forEach(el => {
  el.addEventListener('change', render);
});

clearFiltersBtn.addEventListener('click', () => {
  document.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);
  render();
});

// --- sidebar desplegable ---
function openSidebar(){
  sidebar.classList.add('is-open');
  sidebar.setAttribute('aria-hidden', 'false');
  filterToggle.setAttribute('aria-expanded', 'true');
  if (window.innerWidth <= 780){
    overlay.classList.add('is-visible');
  }
}
function closeSidebar(){
  sidebar.classList.remove('is-open');
  sidebar.setAttribute('aria-hidden', 'true');
  filterToggle.setAttribute('aria-expanded', 'false');
  overlay.classList.remove('is-visible');
}

filterToggle.addEventListener('click', () => {
  sidebar.classList.contains('is-open') ? closeSidebar() : openSidebar();
});
filterClose.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

// abierto por defecto en escritorio
if (window.innerWidth > 780){
  openSidebar();
}
