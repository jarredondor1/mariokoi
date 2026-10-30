import './style.css';
import './refinements.css';
import { mountKoiWorld } from './koi-world.js';
import { previewMarkup, mountTattooPreview, captureTattooPreview } from './tattoo-preview.js';
import { workCollections, portfolioImage } from './portfolio.js';
import { quoteMarkup, mountQuote } from './quote.js';
import './quote.css';
import { mountWorkGallery } from './work-gallery.js';
import './work-gallery.css';
import { mountArtistPortrait } from './artist-portrait.js';
import './artist-portrait.css';
import './tattoo-studio.css';
import './pond-surfaces.css';

document.querySelector('#app').innerHTML = `
  <main class="page" id="main">
  <div class="pond" id="pond" role="img" aria-label="Seis koi ornamentales nadan por el fondo de toda la experiencia"></div>
  <section class="entry" id="entry" aria-label="Entrada al estanque">
    <figure class="entry-art">
      <img src="/images/entrada-tatuador-koi.jpg" width="1536" height="1024" fetchpriority="high" decoding="async" alt="Un tatuador dibuja un koi con un hilo de tinta roja. Ilustración en trazos marfil y rojo." />
    </figure>
    <button class="entry-enter" type="button" disabled>
      <span>ENTRAR</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>
    </button>
    <span class="entry-caption" aria-hidden="true">EL ESTANQUE DESPIERTA</span>
  </section>
  <div class="site-content" id="site-content" inert>
  <section class="intro" id="inicio" aria-label="Estanque de koi">
    <header class="site-header">
      <nav class="site-nav" aria-label="Recorrer el estudio">
        <a href="#sobre-mi">El artista</a><a href="#estudio">La obra</a><a href="#prueba">Tu idea en 3D</a>
      </nav>
      <a class="contact" href="#contacto" data-open-quote aria-haspopup="dialog">HABLEMOS <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M8 5h11v11"/></svg></a>
    </header>

    <div class="hero-copy">
      <h1><span>MARIO</span><span>KOI</span></h1>
      <p>TATUAJE DE AUTOR</p>
    </div>

    <div class="experience-note" aria-hidden="true"><span class="note-rule"></span><span>LA TINTA ESTÁ VIVA</span></div>
    <p class="scene-status" id="scene-status" role="status" aria-live="polite"></p>

    <a class="scroll-cue" href="#sobre-mi" aria-label="Desplazarse a la siguiente sección">
      <i aria-hidden="true"></i>
      <svg viewBox="0 0 18 18" aria-hidden="true"><path d="M9 2v13m-5-5 5 5 5-5"/></svg>
    </a>

  </section>

  <section class="about artist-room" id="sobre-mi" aria-labelledby="about-title" data-portrait-view="look">
    <h2 id="about-title" class="artist-title">Sobre <em>mí.</em></h2>
    <div class="artist-visual">
      <div class="artist-paper" aria-hidden="true"></div>
      <figure class="artist-print">
        <div class="artist-photo-window"><img src="/images/mario-koi-editorial.jpg" alt="Mario Koi concentrado mientras tatúa una pieza ilustrativa a color" loading="lazy" width="1024" height="1536"></div>
        <figcaption><span class="artist-photo-caption">Mario, en el estudio</span><span>KOI</span></figcaption>
      </figure>
      <span class="artist-side-note" aria-hidden="true">EL DIBUJO ENCUENTRA SU PIEL</span>
    </div>
    <div class="artist-story">
      <p class="artist-name">Mario Ochoa<br> Salguero <em>— Koi</em></p>
      <p class="artist-role">Artista tatuador · Diseño ilustrativo y color</p>
      <div class="artist-chapters" role="tablist" aria-label="Conoce mi proceso">
        <button type="button" id="artist-tab-look" role="tab" aria-controls="artist-panel-look" aria-selected="true" data-portrait-view="look">Mi mirada</button>
        <button type="button" id="artist-tab-trace" role="tab" aria-controls="artist-panel-trace" aria-selected="false" tabindex="-1" data-portrait-view="trace">El trazo</button>
        <button type="button" id="artist-tab-skin" role="tab" aria-controls="artist-panel-skin" aria-selected="false" tabindex="-1" data-portrait-view="skin">La piel</button>
      </div>
      <div class="artist-reading">
        <div id="artist-panel-look" role="tabpanel" aria-labelledby="artist-tab-look" data-portrait-panel="look"><p>Soy Mario. Trabajo entre el dibujo y el tatuaje: imágenes con movimiento, color y carácter, creadas para encontrar su lugar en el cuerpo.</p></div>
        <div id="artist-panel-trace" role="tabpanel" aria-labelledby="artist-tab-trace" data-portrait-panel="trace" hidden><p>Cada proyecto empieza escuchando la idea detrás de la pieza. Desde ahí, exploro su ritmo y composición hasta convertirla en un diseño propio.</p></div>
        <div id="artist-panel-skin" role="tabpanel" aria-labelledby="artist-tab-skin" data-portrait-panel="skin" hidden><p>Un diseño propio, pensado para quien lo llevará. Imágenes con movimiento, color y carácter, creadas para encontrar su lugar en el cuerpo.</p></div>
      </div>
      <a class="about-contact" href="#contacto" data-open-quote aria-haspopup="dialog">HABLEMOS DE TU IDEA <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M8 5h11v11"/></svg></a>
    <a class="about-proof artist-proof" href="https://www.laprensa.hn/sociales/tattoo-fest-honduras-agosto-plaza-de-las-banderas-san-pedro-sula-DA26629082" target="_blank" rel="noopener noreferrer">
      <span class="proof-rule" aria-hidden="true"></span><span>En 2025 compartí un seminario de diseño ilustrativo y color en Tattoo Fest Honduras.</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 16 16 4M7 4h9v9"/></svg>
    </a>
    </div>
  </section>

  <section class="work work-immersive" id="estudio" aria-labelledby="work-title">
    <header class="work-heading">
      <h2 id="work-title">La tinta no se queda<br> <em>en la piel.</em></h2>
      <p>Dibujo historias con color, línea y movimiento. Estos son algunos de mis trabajos, sobre la piel y fuera de ella.</p>
    </header>

    <div class="work-browser">
      <div class="work-tabs" role="group" aria-label="Elegir disciplina">
        ${Object.entries(workCollections).map(([key, collection]) => `<button type="button" data-work-category="${key}" aria-pressed="${key === 'all'}">${collection.label}</button>`).join('')}
      </div>
      <div class="work-carousel" role="region" aria-label="Proyectos seleccionados">
        <div class="gallery-space" aria-label="Galería 3D de obras"></div>
        <div class="work-carousel-footer">
          <p class="gallery-instruction">Arrastra para explorar · Toca una foto para verla de cerca</p>
          <p class="work-carousel-caption" role="status" aria-live="polite" aria-atomic="true"></p>
          <div class="work-carousel-controls">
            <button type="button" data-work-play aria-label="Pausar presentación">Pausar</button>
            <button type="button" data-work-direction="previous" aria-label="Proyecto anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m7-7-7 7 7 7"/></svg></button>
            <button type="button" data-work-direction="next" aria-label="Proyecto siguiente"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7"/></svg></button>
          </div>
        </div>
        <article class="work-piece work-slide"></article>
      </div>
    </div>

    <div class="gallery-social"><p class="work-example-note">Cada piel, una historia. Descubre más piezas y procesos en mi Instagram.</p>
    <a class="work-contact" href="https://www.instagram.com/mario.koitattoos/" target="_blank" rel="noopener noreferrer">
      VER MÁS DE MI TRABAJO
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M8 5h11v11"/></svg>
    </a></div>
  </section>
  ${previewMarkup}
  <footer class="studio-footer" id="contacto">
    <div class="footer-invitation">
      <h2>Tu idea empieza<br><em>con una conversación.</em></h2>
      <div><p>Una idea, una referencia o algo que todavía no sabes cómo dibujar. Cuéntame qué tienes en mente.</p>
      <button class="footer-contact" type="button" data-open-quote>Solicitar una cotización <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M8 5h11v11"/></svg></button><a class="footer-whatsapp" href="https://wa.me/50258232830" target="_blank" rel="noopener noreferrer">WhatsApp directo · +502 5823 2830</a></div>
    </div>
    <div class="footer-baseline"><span>Mario Ochoa Salguero · Koi</span><a href="https://www.instagram.com/mario.koitattoos/" target="_blank" rel="noopener noreferrer">Instagram ↗</a><a href="#inicio">Volver arriba ↑</a></div>
  </footer>
  <dialog class="work-viewer" aria-labelledby="viewer-title">
    <button class="viewer-close" type="button" aria-label="Cerrar galería"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg></button>
    <div class="viewer-art"></div>
    <div class="viewer-caption"><div><h2 id="viewer-title"></h2><p class="viewer-description"></p><a class="viewer-source" target="_blank" rel="noopener noreferrer">Ver publicación original</a></div>
      <div class="viewer-controls"><button type="button" data-viewer-step="-1" aria-label="Diseño anterior">←</button><span class="viewer-count" aria-live="polite"></span><button type="button" data-viewer-step="1" aria-label="Diseño siguiente">→</button></div>
    </div>
  </dialog>
  ${quoteMarkup}
  </div>
  </main>
`;

const entry = document.querySelector('#entry');
const enter = document.querySelector('.entry-enter');
const content = document.querySelector('#site-content');
document.documentElement.classList.add('is-entry-open');
document.body.classList.add('is-entry-open');
if (window.location.hash !== '#inicio') {
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#inicio`);
}
window.scrollTo({ top: 0, behavior: 'instant' });
const ready = () => {
  enter.disabled = false;
  entry.classList.add('is-ready');
};

function mountWorkCarousel() {
  const root = document.querySelector('.work-browser');
  const tabs = [...root.querySelectorAll('[data-work-category]')];
  const card = root.querySelector('.work-slide');
  const caption = root.querySelector('.work-carousel-caption');
  const viewer = document.querySelector('.work-viewer');
  let viewerIndex = 0;
  const play = root.querySelector('[data-work-play]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let playing = !reducedMotion.matches, galleryVisible = false;
  function syncPlayback() {
    play.textContent = playing ? 'Pausar' : 'Reproducir';
    play.setAttribute('aria-label', playing ? 'Pausar presentación' : 'Reproducir presentación');
    caption.setAttribute('aria-live', playing ? 'off' : 'polite');
  }
  function pausePlayback() { playing = false; syncPlayback(); }
  root.addEventListener('pointerdown', event => { if (!event.target.closest('[data-work-play]')) pausePlayback(); });
  root.addEventListener('focusin', event => { if (!event.target.closest('[data-work-play]')) pausePlayback(); });
  play.addEventListener('click', () => { playing = !playing; syncPlayback(); });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) pausePlayback(); });
  new IntersectionObserver(entries => { galleryVisible = entries[0].isIntersecting; }, { threshold: .4 }).observe(root.querySelector('.gallery-space'));
  setInterval(() => {
    if (!playing || !galleryVisible || document.hidden || document.querySelector('dialog[open]') || document.documentElement.classList.contains('is-entry-open')) return;
    const count = workCollections[category].items.length;
    if (count > 1) { active = (active + 1) % count; render(); }
  }, 2000);
  syncPlayback();
  const renderViewer = () => {
    const collection = workCollections[category];
    const item = collection.items[viewerIndex];
    viewer.querySelector('.viewer-art').innerHTML = `<img src="${portfolioImage(item)}" alt="${item.title}: trabajo publicado en el perfil de Mario Koi">`;
    viewer.querySelector('#viewer-title').textContent = item.title;
    viewer.querySelector('.viewer-description').textContent = item.credit;
    viewer.querySelector('.viewer-source').href = item.source;
    viewer.querySelectorAll('[data-viewer-step]').forEach(button => button.disabled = collection.items.length < 2);
    viewer.querySelector('.viewer-count').textContent = `${viewerIndex + 1} / ${collection.items.length}`;
  };
  let category = 'all';
  let active = 0;
  const openViewer = () => { viewerIndex = active; renderViewer(); viewer.showModal(); document.body.classList.add('is-viewer-open'); };
  const gallery = mountWorkGallery(root.querySelector('.gallery-space'), index => { active = index; render(); }, openViewer);
  const render = () => {
    const collection = workCollections[category];
    caption.textContent = `${active + 1} / ${collection.items.length}`;
    const item = collection.items[active];
    const link = `<button class="work-slide-link" type="button" data-open-quote data-quote-style="${item.style}" data-quote-reference="${item.source}">Cotizar una idea <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M8 5h11v11"/></svg></button><a class="work-source" href="${item.source}" target="_blank" rel="noopener noreferrer">Ver publicación original</a>`;
    card.dataset.category = category;
    root.querySelectorAll('[data-work-direction]').forEach(button => button.disabled = collection.items.length < 2);
    play.disabled = collection.items.length < 2;
    card.innerHTML = `<div class="work-slide-copy"><div><h3>${item.title}</h3><p class="work-slide-medium">${item.medium}</p></div><div><p>${item.description}</p></div><div class="gallery-actions"><button class="gallery-detail" type="button">Ver de cerca <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4"/></svg></button>${link}</div></div>`;
    gallery.update(collection.items, active);
    root.querySelector('.gallery-instruction').textContent = collection.items.length > 1 ? 'Usa las flechas o desliza · Toca la foto central para verla de cerca' : 'Toca la fotografía para verla de cerca';
  };
  tabs.forEach(tab => tab.addEventListener('click', () => {
    category = tab.dataset.workCategory;
    active = 0;
    tabs.forEach(button => button.setAttribute('aria-pressed', button === tab));
    render();
  }));
  root.querySelectorAll('[data-work-direction]').forEach(button => button.addEventListener('click', () => {
    active = (active + (button.dataset.workDirection === 'next' ? 1 : workCollections[category].items.length - 1)) % workCollections[category].items.length;
    render();
  }));
  card.addEventListener('click', event => { if (event.target.closest('.gallery-detail')) openViewer(); });
  viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('close', () => document.body.classList.remove('is-viewer-open'));
  viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
  const moveViewer = step => { viewerIndex = (viewerIndex + step + workCollections[category].items.length) % workCollections[category].items.length; renderViewer(); };
  viewer.querySelectorAll('[data-viewer-step]').forEach(button => button.addEventListener('click', () => moveViewer(Number(button.dataset.viewerStep))));
  viewer.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); moveViewer(event.key === 'ArrowRight' ? 1 : -1); }
  });
  render();
}

mountWorkCarousel();
mountArtistPortrait(document.querySelector('.artist-room'));
mountQuote(captureTattooPreview);

mountKoiWorld(document.querySelector('#pond'), document.querySelector('#scene-status'), ready, document.querySelector('#estudio'));

enter.addEventListener('click', () => {
  if (enter.disabled) return;
  content.inert = false;
  document.documentElement.classList.remove('is-entry-open');
  document.body.classList.remove('is-entry-open');
  window.scrollTo({ top: 0, behavior: 'instant' });
  entry.classList.add('is-entering');
  const finish = () => {
    entry.remove();
  };
  entry.addEventListener('transitionend', event => {
    if (event.target === entry && event.propertyName === 'opacity') finish();
  }, { once: true });
  window.setTimeout(finish, 900);
});

mountTattooPreview(document.querySelector('#prueba'));
