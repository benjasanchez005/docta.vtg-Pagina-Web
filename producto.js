const productEl = document.getElementById('product');
const notFoundTemplate = document.getElementById('notFoundTemplate');

const params = new URLSearchParams(window.location.search);
const id = params.get('id');

fetch('data/products.json')
  .then(res => res.json())
  .then(data => {
    const producto = data.find(p => String(p.id) === String(id));
    if (!producto){
      productEl.appendChild(notFoundTemplate.content.cloneNode(true));
      return;
    }
    render(producto);
  })
  .catch(err => {
    productEl.innerHTML = '<p class="grid__empty">no se pudo cargar la prenda.</p>';
    console.error(err);
  });

function formatearPrecio(precio){
  if (precio === null || precio === undefined || precio === '') return null;
  const num = Number(precio);
  if (Number.isNaN(num)) return null;
  return num.toLocaleString('es-AR');
}

function render(p){
  document.title = `${p.titulo} — docta.vtg`;

  const imagenes = (p.imagenes && p.imagenes.length) ? p.imagenes : (p.imagen ? [p.imagen] : []);
  const precio = formatearPrecio(p.precio);

  const medidas = [];
  if (p.largo) medidas.push(`largo ${p.largo}cm`);
  if (p.ancho) medidas.push(`ancho ${p.ancho}cm`);

  productEl.innerHTML = `
    <div class="product__gallery">
      <div class="product__main-frame">
        <img id="mainImage" class="product__main-img" src="${imagenes[0] || ''}" alt="${p.titulo}">
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
      <h1 class="product__title">${p.titulo}</h1>
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

  const mainImage = document.getElementById('mainImage');
  productEl.querySelectorAll('.product__thumb').forEach(btn => {
    btn.addEventListener('click', () => {
      mainImage.src = btn.dataset.src;
      productEl.querySelectorAll('.product__thumb').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });
}
