const grid = document.getElementById('grid');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const filterToggle = document.getElementById('filterToggle');
const filterClose = document.getElementById('filterClose');
const clearFiltersBtn = document.getElementById('clearFilters');
const resultCount = document.getElementById('resultCount');
const cardTemplate = document.getElementById('cardTemplate');

const modalOverlay = document.getElementById('modalOverlay');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

let products = [];

// --- carga de datos ---
// Este JSON se genera con scripts/excel_a_json.py a partir del Excel.
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
    link.href = `producto.html?id=${encodeURIComponent(p.id)}`; // por si alguien quiere abrirlo en pestaña nueva (ctrl+click, click derecho)
    link.dataset.id = p.id;
    const img = node.querySelector('.card__img');
    img.src = p.imagen;
    img.alt = p.titulo;
    node.querySelector('.card__talle').textContent = p.talle;
    node.querySelector('.card__title').textContent = p.titulo;
    node.querySelector('.card__meta').textContent = p.subcategoria || p.categoria;
    grid.appendChild(node);
  });
}

// --- click en una prenda: abre el modal en vez de navegar ---
grid.addEventListener('click', (e) => {
  const card = e.target.closest('.card');
  if (!card) return;
  e.preventDefault(); // click normal -> modal. ctrl/cmd+click o click del medio igual abre producto.html en pestaña nueva (comportamiento nativo del navegador)
  const producto = products.find(p => String(p.id) === String(card.dataset.id));
  if (producto) openModal(producto);
});

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

// --- modal de detalle de prenda ---
function formatearPrecio(precio){
  if (precio === null || precio === undefined || precio === '') return null;
  const num = Number(precio);
  if (Number.isNaN(num)) return null;
  return num.toLocaleString('es-AR');
}

function openModal(p){
  const imagenes = (p.imagenes && p.imagenes.length) ? p.imagenes : (p.imagen ? [p.imagen] : []);
  const precio = formatearPrecio(p.precio);

  const medidas = [];
  if (p.largo) medidas.push(`largo ${p.largo}cm`);
  if (p.ancho) medidas.push(`ancho ${p.ancho}cm`);

  modalBody.innerHTML = `
    <div class="product__gallery">
      <div class="product__main-frame">
        <img id="modalMainImage" class="product__main-img" src="${imagenes[0] || ''}" alt="${p.titulo}">
      </div>
      ${imagenes.length > 1 ? `
        <div class="product__thumbs">
          ${imagenes.map((img, i) => `
            <button class="product__thumb ${i === 0 ? 'is-active' : ''}" data-src="${img}">
              <img src="${img}" alt="${p.titulo} foto ${i + 1}">
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>

    <div class="product__info">
      <p class="product__tag">${p.subcategoria || p.categoria}</p>
      <h2 class="product__title" id="modalTitle">${p.titulo}</h2>
      ${precio ? `<p class="product__price">$${precio}</p>` : ''}

      <div class="product__specs">
        ${p.talle ? `<div class="spec"><span>talle</span><span>${p.talle}</span></div>` : ''}
        ${medidas.length ? `<div class="spec"><span>medidas</span><span>${medidas.join(' · ')}</span></div>` : ''}
        ${p.categoria ? `<div class="spec"><span>categoría</span><span>${p.categoria}</span></div>` : ''}
        ${p.estado ? `<div class="spec"><span>estado</span><span>${p.estado}</span></div>` : ''}
        <div class="spec"><span>disponibilidad</span><span>${p.disponible ? 'disponible' : 'vendida'}</span></div>
      </div>

      ${p.descripcion ? `<p class="product__desc">${p.descripcion.replace(/\n/g, '<br>')}</p>` : ''}
      ${p.detalles && p.detalles.toLowerCase() !== 'sin detalles' ? `<p class="product__details"><strong>detalles:</strong> ${p.detalles}</p>` : ''}
    </div>
  `;

  const mainImage = document.getElementById('modalMainImage');
  modalBody.querySelectorAll('.product__thumb').forEach(btn => {
    btn.addEventListener('click', () => {
      mainImage.src = btn.dataset.src;
      modalBody.querySelectorAll('.product__thumb').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });

  modalOverlay.classList.add('is-visible');
  modalOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeModal(){
  modalOverlay.classList.remove('is-visible');
  modalOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('is-visible')) closeModal();
});
