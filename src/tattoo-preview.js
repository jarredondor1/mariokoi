import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { makeTattooGeometry, anchorFromHit, parseMannequin } from './tattoo-surface.js';
import {
  addTattoo,
  createComposition,
  removeSelectedTattoo,
  selectTattoo,
  updateSelectedTattoo,
} from './tattoo-composition.js';

const designs = [{id:'koi',name:'Corriente'},{id:'lotus',name:'Flor de agua'},{id:'serpent',name:'Ciclo'},{id:'moth',name:'Nocturna'}];
const skinTones = [{id:'light',label:'Claro',color:'#d7a580'},{id:'medium',label:'Medio',color:'#9b6344'},{id:'deep',label:'Oscuro',color:'#513121'}];
let capturePreview = null;
export async function captureTattooPreview() { return capturePreview ? capturePreview() : null; }
const focusZones = [
 {id:'body',label:'Cuerpo',target:[0,1.62,.12],distance:5.9,anchor:[.08,2.12,false]},
 {id:'head',label:'Cabeza',target:[0,2.92,.18],distance:.84,anchor:[.12,2.98,false]},
 {id:'neck',label:'Cuello',target:[0,2.55,.28],distance:.82,anchor:[.08,2.58,false]},
 {id:'shoulder',label:'Hombro',target:[.48,2.36,.24],distance:.94,anchor:[.42,2.38,false]},
 {id:'chest',label:'Pecho',target:[.04,2.2,.4],distance:1.05,anchor:[.12,2.16,false]},
 {id:'back',label:'Espalda',target:[0,2.05,-.06],distance:1.05,anchor:[.08,2.08,true],back:true},
 {id:'arm',label:'Brazo',target:[.84,1.92,.2],distance:1.02,anchor:[.84,1.92,false]},
 {id:'hand',label:'Mano',target:[.9,1.8,.28],distance:.76,anchor:[.9,1.8,false]},
 {id:'leg',label:'Pierna',target:[.32,.88,.28],distance:1.12,anchor:[.3,.9,false]},
 {id:'foot',label:'Pie',target:[.32,.16,.3],distance:.62,anchor:[.32,.14,false]},
];
export const previewMarkup = `
<section class="tattoo-lab" id="prueba" aria-labelledby="preview-title">
 <header class="tattoo-heading"><div><h2 id="preview-title">Antes de la <em>tinta.</em></h2><p>Encuentra su lugar en tu piel.</p></div><p class="tattoo-disclaimer">Explora con diseños de ejemplo. La pieza final la trabajamos juntos.</p></header>
 <div class="tattoo-workspace">
  <div class="tattoo-stage"><div class="tattoo-viewport" aria-label="Maniquí 3D para probar un tatuaje"></div><p class="tattoo-loading" role="status">Preparando el cuerpo…</p>
   <div class="tattoo-views" aria-label="Vista del cuerpo"><button type="button" data-view="front">Frente</button><button type="button" data-view="back">Espalda</button><button type="button" data-view="detail">Acercar pieza</button><button type="button" data-view="full">Cuerpo completo</button></div>
   <div class="tattoo-selection-frame" hidden aria-hidden="true"></div><p class="tattoo-selected-label" role="status">Selecciona una pieza</p>
   <p class="tattoo-help">Arrastra el cuerpo para girar · Toca un tatuaje y arrástralo para moverlo</p>
  </div>
  <div class="tattoo-tools">
   <div class="tattoo-tool-heading"><h3>Compón tu pieza.</h3><p class="tattoo-guide">Primero elige el cuerpo y la zona. Después añade tus diseños.</p></div>
   <div class="tattoo-tool-tabs" role="tablist" aria-label="Herramientas del simulador">
    <button type="button" role="tab" id="body-tab" aria-selected="true" aria-controls="body-panel" aria-describedby="body-tab-hint" data-tool-tab="body"><span>El cuerpo</span><small id="body-tab-hint">Modelo, piel y zona</small></button>
    <button type="button" role="tab" id="designs-tab" aria-selected="false" aria-controls="designs-panel" aria-describedby="designs-tab-hint" tabindex="-1" data-tool-tab="designs"><span>Los diseños</span><small id="designs-tab-hint">Añadir y ajustar tatuajes</small></button>
   </div>
   <div class="tattoo-tool-panel" id="body-panel" role="tabpanel" aria-labelledby="body-tab" data-tool-panel="body">
   <fieldset><legend>Elige el cuerpo</legend><div class="tattoo-toggle"><button type="button" data-body="woman" aria-pressed="true">Mujer</button><button type="button" data-body="man" aria-pressed="false">Hombre</button></div></fieldset>
   <fieldset class="tattoo-skin"><legend>Tono de piel</legend><div class="skin-options">${skinTones.map(tone => `<button type="button" data-skin="${tone.id}" aria-pressed="${tone.id === 'medium'}"><i style="--skin:${tone.color}" aria-hidden="true"></i>${tone.label}</button>`).join('')}</div></fieldset>
   <fieldset class="tattoo-zones"><legend>¿Dónde quieres probarlo?</legend><div class="tattoo-zone-list">${focusZones.map(zone=>`<button type="button" data-zone="${zone.id}" aria-pressed="${zone.id==='body'}">${zone.label}</button>`).join('')}</div></fieldset>
   </div>
   <div class="tattoo-tool-panel" id="designs-panel" role="tabpanel" aria-labelledby="designs-tab" data-tool-panel="designs" hidden>
   <fieldset><legend class="tattoo-catalog-label">Diseños de ejemplo</legend><div class="tattoo-designs">${designs.map(d=>`<button type="button" data-design="${d.id}" aria-label="Añadir ${d.name}"><img src="${import.meta.env.BASE_URL}designs/${d.id}.svg" alt="" loading="lazy"><span>${d.name}<b aria-hidden="true">+</b></span></button>`).join('')}</div></fieldset>
   <fieldset class="tattoo-upload"><legend>Prueba tu diseño</legend><input id="tattoo-upload-input" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden><button type="button" data-action="upload">Subir imagen</button><p>PNG, JPG, WebP o SVG. Puedes añadir varias piezas.</p></fieldset>
   </div>
   <div class="tattoo-adjust"><label for="tattoo-size">Tamaño <output id="size-value">100%</output></label><input id="tattoo-size" type="range" min="10" max="180" value="100" step="5"><label for="tattoo-rotation">Giro <output id="rotation-value">0°</output></label><input id="tattoo-rotation" type="range" min="-180" max="180" value="0" step="5"></div>
   <fieldset class="tattoo-composition"><legend>Piezas añadidas</legend><div class="tattoo-composition-list" aria-live="polite"></div></fieldset>
   <p class="tattoo-feedback" role="status" aria-live="polite">La pieza activa se mueve al arrastrarla sobre la piel.</p>
   <div class="tattoo-actions"><button type="button" data-action="reset">Limpiar composición</button><button type="button" data-action="save">Guardar vista<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M8 5h11v11"/></svg></button></div>
  </div>
 </div>
 <div class="tattoo-quote-bridge"><p>¿Ya encontraste dónde lo imaginas? Muéstrame esta composición y conversemos sobre tu pieza.</p><button type="button" data-open-quote data-with-preview>Consultar esta idea</button></div>
</section>`;

export function mountTattooPreview(root) {
 const tabs = [...root.querySelectorAll('[data-tool-tab]')];
 function activateToolTab(button) {
  tabs.forEach(tab => { const active = tab === button; tab.setAttribute('aria-selected', active); tab.tabIndex = active ? 0 : -1; });
  root.querySelectorAll('[data-tool-panel]').forEach(panel => { panel.hidden = panel.dataset.toolPanel !== button.dataset.toolTab; });
 }
 tabs.forEach((button, index) => {
  button.addEventListener('click', () => activateToolTab(button));
  button.addEventListener('keydown', event => {
   if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
   event.preventDefault();
   const next = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs.at(-1) : tabs[(index + 1) % tabs.length];
   activateToolTab(next); next.focus();
  });
 });
 const observer = new IntersectionObserver(entries => {
  if(entries.some(e=>e.isIntersecting)) {observer.disconnect();init(root).catch(error=>{console.error('Tattoo preview:',error);root.querySelector('.tattoo-loading').textContent='No pudimos iniciar la vista 3D. Recarga la página para volver a intentarlo.';});}
 },{rootMargin:'200px'});
 observer.observe(root);
}
async function init(root) {
 const $ = selector => root.querySelector(selector);
 const viewport = $('.tattoo-viewport'), feedback = $('.tattoo-feedback'), loading = $('.tattoo-loading');
 const list = $('.tattoo-composition-list'), catalog = $('.tattoo-designs');
 const scene = new THREE.Scene(); scene.background = new THREE.Color('#d6d0c2');
 const camera = new THREE.PerspectiveCamera(36, 1, .05, 30); camera.position.set(0, 1.62, 5.9);
 const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
 renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7)); renderer.outputColorSpace = THREE.SRGBColorSpace;
 renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
 const canvas = renderer.domElement; canvas.tabIndex = 0;
 canvas.setAttribute('aria-label', 'Vista 3D. Arrastra una zona libre para girar el cuerpo. Toca un tatuaje y arrástralo para moverlo.');
 viewport.append(canvas);
 viewport.append($('.tattoo-selection-frame'));
 const controls = new OrbitControls(camera, canvas); controls.target.set(0, 1.62, 0);
 controls.enableDamping = false; controls.enablePan = true; controls.minDistance = .55; controls.maxDistance = 8;
 controls.minPolarAngle = .08; controls.maxPolarAngle = Math.PI - .08; controls.update();
 scene.add(new THREE.HemisphereLight('#fff9ed', '#667568', 2));
 const key = new THREE.DirectionalLight('#fff6e6', 2.7); key.position.set(-3, 5, 4); scene.add(key);
 const rim = new THREE.DirectionalLight('#e9f0f2', 1.8); rim.position.set(3, 3, -3); scene.add(rim);
 const body = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: skinTones[1].color, roughness: .7 })); scene.add(body);
 const floor = new THREE.Mesh(new THREE.CircleGeometry(1.18, 64), new THREE.MeshStandardMaterial({ color: '#b7b2a5', roughness: 1 }));
 floor.rotation.x = -Math.PI / 2; floor.position.y = -.012; scene.add(floor);

 const state = { body: 'woman', zone: 'body', skin: 'medium' };
 const geometries = new Map(), textures = new Map(), decalMeshes = new Map();
 const raycaster = new THREE.Raycaster();
 let composition = { items: [], selectedId: null };
 let loadVersion = 0, dragPointer = null, pendingPoint = null, frame = 0, ready = false;
 const selected = () => composition.items.find(item => item.id === composition.selectedId);
 const render = () => { if (!document.hidden) { renderer.render(scene, camera); updateSelectionFrame(); } };
 function updateSelectionFrame() {
  const frame = $('.tattoo-selection-frame'), item = selected(), mesh = item && decalMeshes.get(item.id);
  frame.hidden = true;
  if (!mesh || item.anchor.normal.dot(camera.position.clone().sub(item.anchor.point)) <= 0) return;
  mesh.geometry.computeBoundingBox();
  const box = mesh.geometry.boundingBox, points = [];
  for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) points.push(new THREE.Vector3(x,y,z).project(camera));
  if (points.some(point => point.z > 1 || point.z < -1)) return;
  const xs = points.map(p => (p.x + 1) * viewport.clientWidth / 2), ys = points.map(p => (1 - p.y) * viewport.clientHeight / 2);
  frame.style.left = `${Math.min(...xs) - 8}px`; frame.style.top = `${Math.min(...ys) - 8}px`;
  frame.style.width = `${Math.max(...xs) - Math.min(...xs) + 16}px`; frame.style.height = `${Math.max(...ys) - Math.min(...ys) + 16}px`;
  frame.hidden = false;
 }
 const resize = () => {
  const { width, height } = viewport.getBoundingClientRect(); if (!width || !height) return;
  renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix();
  if (camera.position.distanceTo(controls.target) > 4.5) camera.position.sub(controls.target).normalize().multiplyScalar(width < 500 ? 6.9 : 5.9).add(controls.target);
  controls.update(); render();
 };
 root.querySelectorAll('[data-skin]').forEach(button => button.addEventListener('click', () => {
  const tone = skinTones.find(tone => tone.id === button.dataset.skin);
  state.skin = tone.id; body.material.color.set(tone.color);
  root.querySelectorAll('[data-skin]').forEach(option => option.setAttribute('aria-pressed', option === button));
  feedback.textContent = `Tono de piel: ${tone.label.toLowerCase()}. Tus diseños conservan su posición.`;
  render();
 }));
 new ResizeObserver(resize).observe(viewport); controls.addEventListener('change', render);

 function focusZone(id, back = false) {
  const zone = focusZones.find(item => item.id === id) ?? focusZones[0];
  const distance = zone.id === 'body' && viewport.clientWidth < 500 ? 6.9 : zone.distance;
  state.zone = zone.id;
  root.querySelectorAll('[data-zone]').forEach(button => button.setAttribute('aria-pressed', button.dataset.zone === zone.id));
  camera.fov = zone.id === 'body' ? 36 : 28;
  camera.updateProjectionMatrix();
  controls.target.fromArray(zone.target);
  camera.position.copy(controls.target).add(new THREE.Vector3(0, .02, back || zone.back ? -distance : distance));
  controls.update(); render();
 }
 function fullView(back = false) {
  focusZone('body', back);
 }
 function clearDecals() {
  decalMeshes.forEach(mesh => { scene.remove(mesh); mesh.geometry.dispose(); mesh.material.dispose(); }); decalMeshes.clear();
 }
 function renderComposition() {
  clearDecals();
  composition.items.forEach(tattoo => {
   const geometry = makeTattooGeometry(body, tattoo.anchor, .46 * tattoo.size / 100, tattoo.rotation);
   const material = new THREE.MeshBasicMaterial({ map: textures.get(tattoo.design), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, side: THREE.DoubleSide });
   const mesh = new THREE.Mesh(geometry, material); mesh.renderOrder = 2; mesh.userData.tattooId = tattoo.id; scene.add(mesh); decalMeshes.set(tattoo.id, mesh);
  });
  const item = selected(); canvas.dataset.placement = item ? item.anchor.point.toArray().map(value => value.toFixed(4)).join(',') : '';
  render();
 }
 function syncControls() {
  const item = selected(), disabled = !item;
  $('.tattoo-selected-label').textContent = item ? `Editando: ${designs.find(design => design.id === item.design).name}` : 'Añade un diseño para empezar';
  $('[data-view="detail"]').disabled = disabled;
  $('#tattoo-size').disabled = disabled; $('#tattoo-rotation').disabled = disabled;
  $('#tattoo-size').value = item?.size ?? 100; $('#tattoo-rotation').value = item?.rotation ?? 0;
  $('#size-value').value = `${item?.size ?? 100}%`; $('#rotation-value').value = `${item?.rotation ?? 0}°`;
  list.innerHTML = composition.items.map((item, index) => {
   const name = designs.find(design => design.id === item.design).name, active = item.id === composition.selectedId;
   return `<div class="tattoo-composition-item${active ? ' is-selected' : ''}"><button type="button" data-select-tattoo="${item.id}" aria-pressed="${active}"><span>${String(index + 1).padStart(2, '0')}</span><b>${name}</b></button><button type="button" data-remove-tattoo="${item.id}" aria-label="Eliminar ${name}" title="Eliminar ${name}">×</button></div>`;
  }).join('') || '<p class="tattoo-empty">Añade un diseño para empezar.</p>';
 }
 function catalogMarkup(design) {
  const image = design.preview ?? `${import.meta.env.BASE_URL}designs/${design.id}.svg`;
  return `<button type="button" data-design="${design.id}" aria-label="Añadir ${design.name}"><img src="${image}" alt="" loading="lazy"><span>${design.name}<b aria-hidden="true">+</b></span></button>`;
 }
 function renderCatalog() { catalog.innerHTML = designs.map(catalogMarkup).join(''); }
 async function prepareCustomTexture(file) {
  const url = URL.createObjectURL(file);
  try {
   const image = await new Promise((resolve, reject) => { const source = new Image(); source.onload = () => resolve(source); source.onerror = reject; source.src = url; });
   const scale = Math.min(1, 1024 / Math.max(image.naturalWidth, image.naturalHeight));
   const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(image.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
   const context = canvas.getContext('2d', { willReadFrequently: true }); context.drawImage(image, 0, 0, canvas.width, canvas.height);
   const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
   for (let index = 0; index < pixels.data.length; index += 4) {
    const r = pixels.data[index], g = pixels.data[index + 1], b = pixels.data[index + 2], light = (r + g + b) / 3, spread = Math.max(r, g, b) - Math.min(r, g, b);
    if (light > 248 && spread < 10) pixels.data[index + 3] = 0;
    else if (light > 228 && spread < 13) pixels.data[index + 3] = Math.round(pixels.data[index + 3] * (248 - light) / 20);
   }
   context.putImageData(pixels, 0, 0);
   const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
   return { texture, preview: canvas.toDataURL('image/png') };
  } finally { URL.revokeObjectURL(url); }
 }
 function refresh() { renderComposition(); syncControls(); }
 function hitAt(clientX, clientY) {
  const rect = canvas.getBoundingClientRect(); raycaster.setFromCamera(new THREE.Vector2((clientX - rect.left) / rect.width * 2 - 1, -(clientY - rect.top) / rect.height * 2 + 1), camera);
  return raycaster.intersectObject(body)[0];
 }
 function hitTattooAt(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  raycaster.setFromCamera(new THREE.Vector2((clientX - rect.left) / rect.width * 2 - 1, -(clientY - rect.top) / rect.height * 2 + 1), camera);
  return raycaster.intersectObjects([...decalMeshes.values()], false)[0];
 }
 function placeAt(clientX, clientY) {
  const hit = hitAt(clientX, clientY); if (!hit || !selected()) return false;
  composition = updateSelectedTattoo(composition, { anchor: anchorFromHit(hit, body) }); refresh(); return true;
 }
 function defaultAnchor(index = 0) {
  const zone = focusZones.find(item => item.id === state.zone) ?? focusZones[0];
  const fallback = [[.12, 2.22], [-.25, 1.75], [.28, 2.42], [-.34, 1.22], [.42, 2.02]];
  const [baseX, baseY, back] = zone.anchor ?? [...fallback[index % fallback.length], false];
  const offset = state.zone === 'body' ? fallback[index % fallback.length] : [baseX + ((index % 3) - 1) * .07, baseY + (index % 2) * .07];
  const [x, y] = offset; const side = back ? -1 : 1;
  body.updateMatrixWorld(true); raycaster.set(new THREE.Vector3(x, y, side * 3), new THREE.Vector3(0, 0, -side));
  const hit = raycaster.intersectObject(body)[0]; return hit && anchorFromHit(hit, body);
 }
 function flushDrag() { frame = 0; if (pendingPoint) { placeAt(...pendingPoint); pendingPoint = null; } }
 function finishDrag() {
  if (dragPointer === null) return; if (frame) { cancelAnimationFrame(frame); frame = 0; } flushDrag();
  const pointer = dragPointer; dragPointer = null; if (canvas.hasPointerCapture(pointer)) canvas.releasePointerCapture(pointer);
  controls.enabled = true; viewport.classList.remove('is-dragging'); feedback.textContent = 'Toca otra pieza para seleccionarla. Arrastra una zona libre para girar.';
 }
 canvas.addEventListener('pointerdown', event => {
  if (!ready || event.button !== 0 || dragPointer !== null) return;
  const tattooHit = hitTattooAt(event.clientX, event.clientY);
  if (!tattooHit) return;
  const tattooId = tattooHit.object.userData.tattooId;
  if (composition.selectedId !== tattooId) composition = selectTattoo(composition, tattooId);
  event.preventDefault(); event.stopImmediatePropagation(); controls.enabled = false; dragPointer = event.pointerId; canvas.setPointerCapture(dragPointer);
  canvas.focus({ preventScroll: true }); viewport.classList.add('is-dragging'); refresh(); feedback.textContent = 'Pieza elegida. Arrástrala para moverla.'; placeAt(event.clientX, event.clientY);
 }, true);
 canvas.addEventListener('pointermove', event => {
  if (event.pointerId !== dragPointer) return; event.preventDefault(); event.stopImmediatePropagation(); pendingPoint = [event.clientX, event.clientY]; if (!frame) frame = requestAnimationFrame(flushDrag);
 }, true);
 for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(type, event => { if (event.pointerId === dragPointer) { event.stopImmediatePropagation(); finishDrag(); } }, true);
 window.addEventListener('blur', finishDrag);
 canvas.addEventListener('keydown', event => {
  if (!selected() || !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault(); const point = selected().anchor.point.clone().project(camera), rect = canvas.getBoundingClientRect(), step = event.shiftKey ? 12 : 4;
  placeAt(rect.left + (point.x + 1) * rect.width / 2 + (event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0), rect.top + (1 - point.y) * rect.height / 2 + (event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0));
 });
 async function geometry(kind) {
  if (!geometries.has(kind)) { const response = await fetch(`${import.meta.env.BASE_URL}models/preview/${kind}-anatomical.mesh`); if (!response.ok) throw new Error('Mannequin unavailable'); geometries.set(kind, parseMannequin(await response.arrayBuffer())); }
  return geometries.get(kind);
 }
 function startComposition() {
  const anchor = defaultAnchor(); if (!anchor) return;
  composition = createComposition('koi', anchor); focusZone(state.zone); refresh(); feedback.textContent = 'Puedes añadir varios diseños y mover cada pieza por separado.';
 }
 async function changeBody(kind) {
  finishDrag(); const version = ++loadVersion; ready = false; loading.hidden = false;
  const loadedGeometry = await geometry(kind); if (version !== loadVersion) return;
  body.geometry = loadedGeometry; state.body = kind; ready = true; loading.hidden = true;
  root.querySelectorAll('[data-body]').forEach(button => button.setAttribute('aria-pressed', button.dataset.body === kind)); startComposition();
 }
 await Promise.all(designs.map(async design => { const texture = await new THREE.TextureLoader().loadAsync(`${import.meta.env.BASE_URL}designs/${design.id}.svg`); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = renderer.capabilities.getMaxAnisotropy(); textures.set(design.id, texture); }));
 root.querySelectorAll('[data-body]').forEach(button => button.addEventListener('click', () => changeBody(button.dataset.body).catch(() => { loading.hidden = true; ready = Boolean(selected()); feedback.textContent = 'No se pudo cargar el cuerpo. Inténtalo de nuevo.'; })));
 root.querySelectorAll('[data-zone]').forEach(button => button.addEventListener('click', () => { finishDrag(); focusZone(button.dataset.zone); feedback.textContent = `${button.textContent} en foco. Añade o mueve una pieza en esta zona.`; }));
 catalog.addEventListener('click', event => { const button = event.target.closest('[data-design]'); if (!button) return;
  const anchor = defaultAnchor(composition.items.length); if (!anchor) return; composition = addTattoo(composition, button.dataset.design, anchor); refresh(); feedback.textContent = 'Nueva pieza añadida. Tócala directamente para moverla.';
 });
 const uploadInput = $('#tattoo-upload-input');
 $('[data-action="upload"]').addEventListener('click', () => uploadInput.click());
 uploadInput.addEventListener('change', async event => {
  const [file] = event.target.files; if (!file) return;
  try {
   feedback.textContent = 'Optimizando tu diseño…';
   const prepared = await prepareCustomTexture(file), id = `custom-${Date.now()}`, name = file.name.replace(/\.[^.]+$/, '').slice(0, 22) || 'Tu diseño';
   designs.push({ id, name, preview: prepared.preview }); textures.set(id, prepared.texture); renderCatalog();
   const anchor = defaultAnchor(composition.items.length); if (!anchor) throw new Error('No placement surface');
   composition = addTattoo(composition, id, anchor); refresh(); feedback.textContent = 'Tu diseño está listo. Tócalo directamente para moverlo.';
  } catch { feedback.textContent = 'No pudimos preparar esa imagen. Prueba con PNG, JPG, WebP o SVG.'; }
  event.target.value = '';
 });
 list.addEventListener('click', event => {
  const removeButton = event.target.closest('[data-remove-tattoo]');
  if (removeButton) {
   composition = removeSelectedTattoo(selectTattoo(composition, removeButton.dataset.removeTattoo));
   refresh(); feedback.textContent = selected() ? 'Pieza eliminada. Puedes elegir otra para editarla.' : 'Composición vacía. Añade un diseño para continuar.';
   return;
  }
  const button = event.target.closest('[data-select-tattoo]'); if (!button) return;
  composition = selectTattoo(composition, button.dataset.selectTattoo); refresh(); feedback.textContent = 'Pieza elegida. También puedes tocarla directamente en el cuerpo.';
 });
 for (const [id, key, suffix] of [['size', 'size', '%'], ['rotation', 'rotation', '°']]) $('#tattoo-' + id).addEventListener('input', event => { if (!selected()) return; composition = updateSelectedTattoo(composition, { [key]: Number(event.target.value) }); refresh(); });
 root.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => { finishDrag(); if (button.dataset.view === 'detail' && selected()) { controls.target.copy(selected().anchor.point); camera.position.copy(selected().anchor.point).addScaledVector(selected().anchor.normal, 1.55); controls.update(); render(); } else fullView(button.dataset.view === 'back'); }));
 $('[data-action="reset"]').addEventListener('click', () => { finishDrag(); startComposition(); });
 $('[data-action="save"]').addEventListener('click', () => { render(); canvas.toBlob(blob => { if (!blob) { feedback.textContent = 'No se pudo guardar la imagen.'; return; } const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = 'mario-koi-composicion.png'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); feedback.textContent = 'Vista guardada como imagen.'; }, 'image/png'); });
 await changeBody('woman'); resize();
 capturePreview = async () => {
  if (!ready || !composition.items.length) return null;
  render();
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return null;
  return { file: new File([blob], 'mi-idea-mario-koi.png', {type:'image/png'}),
   zone: focusZones.find(zone => zone.id === state.zone)?.label,
   summary: `Modelo: ${state.body === 'woman' ? 'mujer' : 'hombre'}. Piel: ${skinTones.find(tone => tone.id === state.skin).label}. Vista: ${focusZones.find(zone => zone.id === state.zone)?.label}. Piezas: ${composition.items.map(item => designs.find(d => d.id === item.design)?.name || 'Diseño propio').join(', ')}.` };
 };
 document.addEventListener('visibilitychange', () => { finishDrag(); if (!document.hidden) render(); });
 canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); finishDrag(); loading.hidden = false; loading.textContent = 'La vista 3D se interrumpió. Recarga la página para recuperarla.'; });
}
