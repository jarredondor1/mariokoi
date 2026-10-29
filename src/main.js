import './style.css';
import { mountHeroSculpture, mountArmPreview } from './three-scene.js';

const instagram = 'https://www.instagram.com/mario.koitattoos/';
const works = [
  { id: '01', image: '2b27021b2c0b49a0.jpg', title: 'Color que cuenta historias', category: 'color', tag: 'COLOR / COMPOSICIÓN', href: 'https://www.instagram.com/mario.koitattoos/reel/Cry1WNZO2p7/' },
  { id: '02', image: '76ec78cf3ca98a19.jpg', title: 'Símbolos en movimiento', category: 'color', tag: 'COLOR / SÍMBOLOS', href: 'https://www.instagram.com/mario.koitattoos/reel/Cp8Bv-zAAEY/' },
  { id: '03', image: '8b4e4104a88c1f96.jpg', title: 'Narrativa sobre piel', category: 'color', tag: 'COLOR / PERSONAJES', href: 'https://www.instagram.com/mario.koitattoos/reel/CoDPG60Jmva/' },
  { id: '04', image: 'af19aee4348445cd.jpg', title: 'Tiempo y detalle', category: 'negro', tag: 'NEGRO Y GRIS', href: 'https://www.instagram.com/sublimetattoogt/p/Dexe8oDkXUw/' },
  { id: '05', image: '6886690ae0f62cb5.jpg', title: 'Flores que permanecen', category: 'naturaleza', tag: 'NATURALEZA / COLOR', href: 'https://www.instagram.com/sublimetattoogt/p/DdMstNBkdem/' },
  { id: '06', image: '3ca3e722cc387de5.jpg', title: 'Otros universos', category: 'personajes', tag: 'PERSONAJES / COLOR', href: 'https://www.instagram.com/mario.koitattoos/reel/DbEVmAJKEA0/' },
  { id: '07', image: '42a99ddcd357426d.jpg', title: 'El quetzal', category: 'naturaleza', tag: 'NATURALEZA / COLOR', href: 'https://www.instagram.com/sublimetattoogt/p/DYXg2VDxDo_/' },
  { id: '08', image: 'a696b45495b2174e.jpg', title: 'Mitos y criaturas', category: 'personajes', tag: 'PERSONAJES / COLOR', href: 'https://www.instagram.com/mario.koitattoos/reel/DXZzv6pineS/' },
  { id: '09', image: '31811a34dffafd8a.jpg', title: 'Línea y sombra', category: 'negro', tag: 'NEGRO Y GRIS / FLORAL', href: 'https://www.instagram.com/sublimetattoogt/reel/DXKzxcCkWpC/' },
];

document.querySelector('#app').innerHTML = `
  <header class="site-header" id="top">
    <a class="brand" href="#top" aria-label="Mario Koi, ir al inicio"><span class="brand-mark">MK<span class="brand-dot">.</span></span><span class="brand-sub">MARIO KOI<br> TATTOO ARTIST</span></a>
    <nav class="nav" aria-label="Navegación principal">
      <a href="#obra">Obra</a><a href="#laboratorio">Laboratorio 3D</a><a href="#artista">El artista</a>
    </nav>
    <a class="header-cta" href="#contacto">Hablemos de tu idea <span aria-hidden="true">↗</span></a>
    <button class="menu-toggle" aria-label="Abrir menú" aria-expanded="false"><span></span><span></span></button>
  </header>
  <main id="main">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-grid" aria-hidden="true"></div>
      <div class="hero-copy">
        <div class="eyebrow"><span class="eyebrow-line"></span> ARTISTA TATUADOR · ANTIGUA GUATEMALA</div>
        <h1 id="hero-title">LA IDEA<br><em>TOMA</em><br>CUERPO<span class="period">.</span></h1>
        <p>El tatuaje empieza mucho antes de la tinta. Explora la obra, juega con una idea y descubre cómo puede vivir sobre tu piel.</p>
        <div class="hero-actions"><a class="button button-lime" href="#laboratorio">Entrar al laboratorio <span>↗</span></a><a class="text-link" href="#obra">Ver el trabajo <span>↓</span></a></div>
      </div>
      <div class="hero-art" aria-label="Escultura orgánica interactiva realizada con Three.js">
        <div id="hero-canvas" class="hero-canvas"></div>
        <div class="hero-art-top">EXPERIMENTO 001 <span> / </span> TINTA VIVA</div>
        <div class="hero-art-bottom"><span class="pulse-dot"></span> MUEVE EL CURSOR / ARRASTRA</div>
      </div>
      <div class="hero-index">01 — 04 <span>DESLIZA PARA DESCUBRIR</span></div>
    </section>

    <div class="ticker" aria-hidden="true"><div>ARTE QUE SE MUEVE CONTIGO <span>✳</span> IDEAS QUE DEJAN HUELLA <span>✳</span> ARTE QUE SE MUEVE CONTIGO <span>✳</span> IDEAS QUE DEJAN HUELLA <span>✳</span></div></div>

    <section id="obra" class="work-section section-pad" aria-labelledby="work-title">
      <div class="section-intro"><div><span class="section-kicker">01 / OBRA EN PIEL</span><h2 id="work-title">NO HAY DOS<br><em>HISTORIAS</em> IGUALES<span class="period">.</span></h2></div><p>Una selección de trabajos reales. Cada pieza encuentra su forma entre la idea, el cuerpo y el trazo.</p></div>
      <div class="filter-row" role="group" aria-label="Filtrar trabajos">
        <button class="filter active" data-filter="todos" aria-pressed="true">Todo <span>09</span></button>
        <button class="filter" data-filter="color" aria-pressed="false">Color</button>
        <button class="filter" data-filter="negro" aria-pressed="false">Negro y gris</button>
        <button class="filter" data-filter="naturaleza" aria-pressed="false">Naturaleza</button>
        <button class="filter" data-filter="personajes" aria-pressed="false">Personajes</button>
      </div>
      <div class="work-grid" id="work-grid"></div>
      <a class="all-work" href="${instagram}" target="_blank" rel="noopener noreferrer">Más obra en Instagram <span>↗</span></a>
    </section>

    <section class="statement" aria-label="La filosofía de Mario Koi"><span class="statement-star">✳</span><p>NO BUSCO LLENAR ESPACIOS.<br>BUSCO QUE UNA IDEA <em>ENCUENTRE SU LUGAR.</em></p><span class="statement-caption">MARIO KOI / ANTIGUA GUATEMALA</span></section>

    <section id="laboratorio" class="lab-section section-pad" aria-labelledby="lab-title">
      <div class="lab-heading"><span class="section-kicker">02 / LABORATORIO DE IDEAS</span><h2 id="lab-title">IMAGINA.<br><em>MUÉVELO.</em> SIENTE.</h2><p>Un primer vistazo a cómo una idea puede dialogar con el cuerpo. Prueba motivos, tonos y ángulos. El diseño final lo creamos juntos.</p></div>
      <div class="lab-layout">
        <div class="lab-panel">
          <div class="lab-panel-head"><span>INK LAB</span><span>EXPERIMENTO / 001</span></div>
          <div class="lab-step"><span class="step-number">01</span><div><h3>Elige un universo</h3><p>Un punto de partida para imaginar tu pieza.</p><div class="choice-list" role="group" aria-label="Elegir motivo"><button class="motif active" data-motif="quetzal" aria-pressed="true">Quetzal <span>↗</span></button><button class="motif" data-motif="koi" aria-pressed="false">Koi <span>↗</span></button><button class="motif" data-motif="flor" aria-pressed="false">Floral <span>↗</span></button></div></div></div>
          <div class="lab-step"><span class="step-number">02</span><div><h3>Elige un tono</h3><p>Observa cómo cambia la lectura del trazo.</p><div class="tone-list" role="group" aria-label="Tono de piel"><button class="tone active" data-tone="light" aria-label="Tono de piel claro" aria-pressed="true" style="--tone:#d5a67f"></button><button class="tone" data-tone="medium" aria-label="Tono de piel medio" aria-pressed="false" style="--tone:#a36b4b"></button><button class="tone" data-tone="deep" aria-label="Tono de piel oscuro" aria-pressed="false" style="--tone:#68422f"></button></div></div></div>
          <div class="lab-step lab-step-final"><span class="step-number">03</span><div><h3>Dale tu dirección</h3><p>Cuéntame qué te gustaría llevar a la piel.</p><a class="button button-dark" href="#contacto">Convertirlo en proyecto <span>↗</span></a></div></div>
        </div>
        <div class="preview-panel"><div class="preview-top"><span>VISTA PRELIMINAR / 3D</span><span class="live-indicator"><i></i> INTERACTIVO</span></div><div id="arm-canvas" class="arm-canvas" aria-label="Vista conceptual tridimensional de un tatuaje sobre un brazo"></div><div class="preview-bottom"><span>ARRASTRA PARA GIRAR</span><button id="reset-view" type="button" aria-label="Restablecer vista">↺ &nbsp; REINICIAR VISTA</button></div></div>
      </div>
      <p class="lab-note">* Visualización conceptual para explorar una dirección. Tamaño, composición y ubicación se definen durante la consulta.</p>
    </section>

    <section id="artista" class="artist-section section-pad" aria-labelledby="artist-title"><div class="artist-left"><span class="section-kicker">03 / DETRÁS DE LA TINTA</span><h2 id="artist-title">MARIO<br><em>KOI.</em></h2><p>Artista tatuador en Antigua Guatemala. Mi trabajo viaja entre el color, el símbolo, la naturaleza y los personajes. Me interesa crear piezas que se sientan propias de quien las lleva.</p><a class="text-link dark-link" href="${instagram}" target="_blank" rel="noopener noreferrer">Conocer más en Instagram <span>↗</span></a></div><div class="artist-art"><img src="/images/42a99ddcd357426d.jpg" alt="Tatuaje de quetzal a color del portafolio de Mario Koi" loading="lazy"><div class="artist-art-label">HECHO EN ANTIGUA GUATEMALA <span>↗</span></div></div></section>

    <section id="contacto" class="contact-section section-pad" aria-labelledby="contact-title"><div><span class="section-kicker">04 / TU IDEA EMPIEZA AQUÍ</span><h2 id="contact-title">HAGAMOS<br>QUE <em>EXISTA.</em></h2><p>¿Tienes una idea clara o apenas una sensación? Escríbeme. Cuéntame qué imaginas y en qué parte del cuerpo te gustaría llevarla.</p><div class="contact-actions"><a class="button button-lime" href="${instagram}" target="_blank" rel="noopener noreferrer">Escríbeme en Instagram <span>↗</span></a><button class="text-link" id="open-brief" type="button">Preparar mi brief <span>↗</span></button></div></div><div class="contact-symbol" aria-hidden="true"><span>✳</span></div></section>
  </main>
  <footer class="footer"><a class="brand" href="#top" aria-label="Volver al inicio"><span class="brand-mark">MK<span class="brand-dot">.</span></span><span class="brand-sub">MARIO KOI<br> TATTOO ARTIST</span></a><p>Antigua Guatemala · Arte que toma cuerpo.</p><a href="${instagram}" target="_blank" rel="noopener noreferrer">Instagram ↗</a><span>© ${new Date().getFullYear()} Mario Koi</span></footer>
  <dialog id="brief-dialog" class="brief-dialog"><form method="dialog" id="brief-form"><button class="dialog-close" type="button" aria-label="Cerrar">×</button><span class="section-kicker">EMPECEMOS POR UNA IDEA</span><h2>CUÉNTAME<br><em>QUÉ IMAGINAS.</em></h2><label>Tu idea<textarea id="brief-idea" rows="4" maxlength="500" placeholder="Un quetzal entre flores, algo inspirado en..." required></textarea></label><label>¿Dónde lo imaginas?<select id="brief-placement"><option value="Aún no lo sé">Aún no lo sé</option><option>Brazo</option><option>Antebrazo</option><option>Espalda</option><option>Pierna</option><option>Otra zona</option></select></label><button class="button button-dark" type="submit">Preparar y copiar mensaje <span>↗</span></button><div id="brief-result" class="brief-result" hidden><label>Tu mensaje<textarea id="brief-message" rows="5" readonly></textarea></label><a class="button button-lime" href="${instagram}" target="_blank" rel="noopener noreferrer">Abrir Instagram para enviarlo <span>↗</span></a></div><p>El mensaje se prepara en tu dispositivo. Pégalo en Instagram para enviárselo a Mario.</p></form></dialog>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
`;

const grid = document.querySelector('#work-grid');
function renderWorks(filter = 'todos') {
  grid.innerHTML = works.filter(work => filter === 'todos' || work.category === filter || (filter === 'color' && ['naturaleza', 'personajes'].includes(work.category))).map(work => `
    <a class="work-card" href="${work.href}" target="_blank" rel="noopener noreferrer" aria-label="Ver ${work.title} en Instagram">
      <div class="work-image"><img src="/images/${work.image}" alt="${work.title}, tatuaje del portafolio de Mario Koi" loading="lazy"><span class="work-arrow" aria-hidden="true">↗</span></div>
      <div class="work-meta"><span>${work.id} / ${work.tag}</span><h3>${work.title}</h3></div>
    </a>`).join('');
}
renderWorks();

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
  renderWorks(button.dataset.filter);
}));

const menu = document.querySelector('.menu-toggle');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  document.querySelector('.nav').classList.toggle('open', open);
});
document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => {
  menu.setAttribute('aria-expanded', 'false');
  document.querySelector('.nav').classList.remove('open');
}));

const preview = mountArmPreview(document.querySelector('#arm-canvas'));
mountHeroSculpture(document.querySelector('#hero-canvas'));
document.querySelectorAll('.motif').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.motif').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
  preview.setMotif(button.dataset.motif);
}));
document.querySelectorAll('.tone').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.tone').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
  preview.setTone(button.dataset.tone);
}));
document.querySelector('#reset-view').addEventListener('click', preview.reset);

const dialog = document.querySelector('#brief-dialog');
document.querySelector('#open-brief').addEventListener('click', () => dialog.showModal());
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
let toastTimer;
function showToast(message) {
  const el = document.querySelector('#toast');
  el.textContent = message; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}
document.querySelector('#brief-form').addEventListener('submit', async event => {
  event.preventDefault();
  const idea = document.querySelector('#brief-idea').value.trim();
  if (!idea) return;
  const placement = document.querySelector('#brief-placement').value;
  const motif = document.querySelector('.motif.active').textContent.replace('↗', '').trim();
  const message = `Hola Mario, vi tu Ink Lab. Mi idea: ${idea}\nZona: ${placement}.\nInspiración que exploré: ${motif}.`;
  document.querySelector('#brief-message').value = message;
  document.querySelector('#brief-result').hidden = false;
  try { await navigator.clipboard.writeText(message); showToast('Mensaje copiado. Pégalo en Instagram.'); }
  catch { showToast('Selecciona el mensaje para copiarlo antes de salir.'); }
});
