import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { portfolioImage } from './portfolio.js';

// A photographic space rendered with Three.js. DOM photographs retain their
// native resolution, accessible names and keyboard interaction in the 3D scene.
export function mountWorkGallery(host, onSelect, onOpen) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 1, 6000);
  const renderer = new CSS3DRenderer();
  host.append(renderer.domElement);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let objects = [], items = [], active = 0, position = 0, target = 0;
  let width = 1, height = 1, frame = 0, visible = false, pointer = null, suppress = 0;
  const wrap = (value, count) => ((value % count) + count) % count;
  function draw() {
    frame = 0;
    if (!visible || document.hidden) return;
    position += (target - position) * (reduced.matches ? 1 : .13);
    if (Math.abs(target - position) < .001) position = target;
    const cardHeight = height - 84;
    const cardWidth = Math.min(width * .64, cardHeight * .75, 320);
    objects.forEach((object, index) => {
      let offset = index - position;
      if (items.length > 1) offset = wrap(offset + items.length / 2, items.length) - items.length / 2;
      const distance = Math.abs(offset);
      object.visible = distance < 3.2;
      object.element.style.display = object.visible ? '' : 'none';
      object.element.style.width = `${cardWidth}px`;
      object.element.style.height = `${cardHeight}px`;
      object.position.set(offset * (cardWidth + 36), -Math.min(distance, 3) * 20, -Math.pow(distance, 1.15) * 200);
      object.rotation.y = -Math.max(-2, Math.min(2, offset)) * .24;
      object.rotation.z = offset * -.022;
      object.element.style.filter = `brightness(${Math.max(.48, 1 - distance * .15)})`;
      object.element.style.zIndex = String(100 - Math.round(distance * 10));
      object.element.tabIndex = index === active ? 0 : -1;
      object.element.setAttribute('aria-label', `${index === active ? 'Ver en detalle' : 'Seleccionar'}: ${items[index].title}`);
    });
    renderer.render(scene, camera);
    if (position !== target) requestDraw();
  }
  function requestDraw() { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw); }
  function resize() {
    width = host.clientWidth; height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.position.z = height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.updateProjectionMatrix(); requestDraw();
  }
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) {resize();requestDraw();} }).observe(host);
  document.addEventListener('visibilitychange', requestDraw);
  host.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    pointer = { id:event.pointerId, x:event.clientX, y:event.clientY, start:target, dragging:false };
  });
  host.addEventListener('pointermove', event => {
    if (!pointer || pointer.id !== event.pointerId || items.length < 2) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    if (!pointer.dragging && Math.abs(dx) > 9 && Math.abs(dx) > Math.abs(dy)) {
      pointer.dragging = true; host.setPointerCapture(event.pointerId); host.classList.add('is-dragging');
    }
    if (pointer.dragging) {target = pointer.start - dx / Math.min(260, width * .6);requestDraw();}
  });
  function finish(event) {
    if (!pointer || pointer.id !== event.pointerId) return;
    if (pointer.dragging) {
      suppress = performance.now() + 250;
      target = Math.round(target); active = wrap(target, items.length); onSelect(active); requestDraw();
    }
    pointer = null; host.classList.remove('is-dragging');
  }
  host.addEventListener('pointerup', finish);
  host.addEventListener('pointercancel', finish);
  host.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); onSelect(wrap(active + (event.key === 'ArrowRight' ? 1 : -1), items.length));
    }
  });
  return {
    update(nextItems, selected) {
      if (items !== nextItems) {
        objects.forEach(object => { scene.remove(object); object.element.remove(); });
        items = nextItems; position = target = selected;
        objects = items.map((item, index) => {
          const button = document.createElement('button'); button.type = 'button'; button.className = 'gallery-photo';
          const img = document.createElement('img'); img.src = portfolioImage(item); img.alt = item.title; img.draggable = false;
          button.append(img);
          button.addEventListener('click', () => {
            if (performance.now() < suppress) return;
            if (index === active) onOpen(); else onSelect(index);
          });
          const object = new CSS3DObject(button); scene.add(object); return object;
        });
      }
      active = selected;
      let delta = selected - wrap(target, items.length);
      if (delta > items.length / 2) delta -= items.length;
      if (delta < -items.length / 2) delta += items.length;
      target += delta; requestDraw();
    }
  };
}
