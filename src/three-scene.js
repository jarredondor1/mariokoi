import * as THREE from 'three';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function makeRenderer(element, alpha = true) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.setSize(element.clientWidth, element.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  element.appendChild(renderer.domElement);
  return renderer;
}

function watchSize(element, camera, renderer) {
  const observer = new ResizeObserver(() => {
    const width = Math.max(1, element.clientWidth);
    const height = Math.max(1, element.clientHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
  observer.observe(element);
}

function watchVisibility(element, callback) {
  const observer = new IntersectionObserver(entries => callback(entries[0]?.isIntersecting ?? true), { threshold: 0 });
  observer.observe(element);
}

function fallback(element, title) {
  element.innerHTML = `<div class="webgl-fallback" role="img" aria-label="${title}"><span>✳</span><small>IMAGINA LA FORMA</small></div>`;
}

export function mountHeroSculpture(element) {
  let renderer;
  try { renderer = makeRenderer(element); } catch { fallback(element, 'Escultura abstracta de tinta'); return; }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
  camera.position.set(0, 0, 9.8);
  const object = new THREE.Group();
  scene.add(object);

  const geometry = new THREE.SphereGeometry(2.2, 96, 64);
  const base = geometry.attributes.position.array.slice();
  const colors = [];
  const c1 = new THREE.Color('#d78064');
  const c2 = new THREE.Color('#f4bf8f');
  const c3 = new THREE.Color('#804b3c');
  for (let i = 0; i < geometry.attributes.position.count; i++) {
    const y = base[i * 3 + 1] / 2.2;
    const x = base[i * 3] / 2.2;
    const color = c3.clone().lerp(c1, THREE.MathUtils.smoothstep(y, -1, .3)).lerp(c2, THREE.MathUtils.smoothstep(x + y, -.2, 1.5) * .5);
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const material = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .42, metalness: .05, clearcoat: .45, clearcoatRoughness: .33, side: THREE.DoubleSide });
  const blob = new THREE.Mesh(geometry, material);
  object.add(blob);

  const drawInkLine = (radius, phase, color, width) => {
    const points = [];
    for (let i = 0; i <= 180; i++) {
      const t = i / 180 * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(t + phase) * radius,
        Math.sin(t * 1.3 + phase) * radius * .42,
        Math.sin(t + phase) * radius * .7
      ));
    }
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 180, width, 8, false), new THREE.MeshStandardMaterial({ color, roughness: .55 }));
    tube.rotation.set(.45, .15, .35);
    object.add(tube);
  };
  drawInkLine(2.27, 0, '#1b2b26', .023);
  drawInkLine(2.36, 1.1, '#deea77', .027);

  const light1 = new THREE.DirectionalLight('#fff1cc', 3.5); light1.position.set(-3, 5, 5); scene.add(light1);
  const light2 = new THREE.DirectionalLight('#df7169', 2.2); light2.position.set(4, -2, -1); scene.add(light2);
  scene.add(new THREE.AmbientLight('#d1e8ca', 1.1));
  watchSize(element, camera, renderer);
  let visible = true; watchVisibility(element, value => visible = value);
  let targetX = 0, targetY = 0;
  element.addEventListener('pointermove', event => {
    const r = element.getBoundingClientRect();
    targetX = ((event.clientX - r.left) / r.width - .5) * .5;
    targetY = ((event.clientY - r.top) / r.height - .5) * .45;
  });
  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const time = reducedMotion ? 0 : clock.getElapsedTime();
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const j = i * 3, x = base[j], y = base[j + 1], z = base[j + 2];
      const wave = 1 + .065 * Math.sin(2.7 * x + 1.25 * time) * Math.cos(2.4 * y - .8 * time) + .04 * Math.sin(3.9 * z + 1.1 * time);
      positions.setXYZ(i, x * wave, y * wave, z * wave);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    object.rotation.y += (targetX + (reducedMotion ? .25 : time * .12) - object.rotation.y) * .025;
    object.rotation.x += (-targetY + .12 - object.rotation.x) * .025;
    object.position.y = reducedMotion ? 0 : Math.sin(time * .7) * .12;
    renderer.render(scene, camera);
  }
  frame();
}

const tones = { light: '#d5a67f', medium: '#a36b4b', deep: '#68422f' };

function makeMotifTexture(motif) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.translate(512, 512);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const ink = '#17271f', red = '#b74331', leaf = '#315f4b';
  if (motif === 'quetzal') {
    ctx.strokeStyle = ink; ctx.lineWidth = 21;
    ctx.beginPath(); ctx.moveTo(-38, -82); ctx.bezierCurveTo(65, 72, 98, 235, -58, 370); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(30, -65); ctx.bezierCurveTo(135, 95, 190, 155, 48, 365); ctx.stroke();
    ctx.fillStyle = leaf; ctx.strokeStyle = ink; ctx.lineWidth = 15;
    ctx.beginPath(); ctx.moveTo(-188, -125); ctx.bezierCurveTo(-220, -285, -88, -345, 30, -260); ctx.bezierCurveTo(126, -210, 105, -62, 8, 24); ctx.bezierCurveTo(-75, 92, -170, 18, -188, -125); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#d6e979';
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(-80 + i * 32, -112 + i * 10, 15, 66, -.7, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = red; ctx.beginPath(); ctx.ellipse(-24, 18, 48, 30, .2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(27, -243, 9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(77, -231); ctx.lineTo(161, -200); ctx.lineTo(73, -188); ctx.fill();
  } else if (motif === 'koi') {
    ctx.strokeStyle = ink; ctx.lineWidth = 18;
    ctx.beginPath(); ctx.moveTo(-186, 252); ctx.bezierCurveTo(-320, 20, -180, -242, 85, -252); ctx.bezierCurveTo(290, -235, 245, 45, 40, 120); ctx.bezierCurveTo(-110, 175, -115, 45, -40, -70); ctx.stroke();
    ctx.fillStyle = '#e76f4c'; ctx.beginPath(); ctx.moveTo(-105, -145); ctx.bezierCurveTo(-50, -290, 155, -285, 203, -134); ctx.bezierCurveTo(258, 34, 30, 145, -103, 10); ctx.bezierCurveTo(-145, -40, -140, -85, -105, -145); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f4d597'; ctx.beginPath(); ctx.ellipse(37, -122, 72, 94, -.45, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(137, -169, 12, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-83, 4); ctx.lineTo(-220, 105); ctx.lineTo(-160, -45); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-120, 105); ctx.lineTo(-288, 284); ctx.lineTo(-35, 225); ctx.fill();
    ctx.strokeStyle = ink; ctx.lineWidth = 9;
    for (let i = 0; i < 4; i++) {ctx.beginPath(); ctx.arc(200, 135, 22 + i * 20, .2, Math.PI * 1.4); ctx.stroke();}
  } else {
    ctx.strokeStyle = ink; ctx.lineWidth = 16;
    ctx.beginPath(); ctx.moveTo(0, 50); ctx.bezierCurveTo(-110, 160, 78, 260, -42, 375); ctx.stroke();
    ctx.fillStyle = leaf;
    ctx.beginPath(); ctx.moveTo(-25, 212); ctx.bezierCurveTo(-160, 90, -220, 190, -25, 260); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(35, 295); ctx.bezierCurveTo(218, 132, 243, 285, 25, 345); ctx.fill(); ctx.stroke();
    ctx.fillStyle = red;
    for (let i = 0; i < 9; i++) {ctx.save(); ctx.rotate(i * Math.PI * 2 / 9); ctx.beginPath(); ctx.ellipse(0, -117, 61, 133, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();}
    ctx.fillStyle = '#d9ee75'; ctx.beginPath(); ctx.arc(0, 0, 73, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = ink; ctx.lineWidth = 7;
    for (let i = 0; i < 8; i++) { const a = i * Math.PI * 2 / 8; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 24, Math.sin(a) * 24); ctx.lineTo(Math.cos(a) * 58, Math.sin(a) * 58); ctx.stroke(); }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function mountArmPreview(element) {
  let renderer;
  try { renderer = makeRenderer(element); } catch { fallback(element, 'Vista de un motivo de tatuaje sobre el brazo'); return { setMotif() {}, setTone() {}, reset() {} }; }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(37, 1, .1, 100);
  camera.position.set(0, .1, 8.2);
  const arm = new THREE.Group(); arm.rotation.z = -.12; scene.add(arm);
  const skin = new THREE.MeshStandardMaterial({ color: tones.light, roughness: .78, metalness: 0 });
  const shape = new THREE.CylinderGeometry(.95, .66, 4.25, 64, 24, false);
  arm.add(new THREE.Mesh(shape, skin));
  const top = new THREE.Mesh(new THREE.SphereGeometry(.95, 48, 24), skin); top.position.y = 2.11; top.scale.y = .44; arm.add(top);
  const bottom = new THREE.Mesh(new THREE.SphereGeometry(.66, 48, 24), skin); bottom.position.y = -2.11; bottom.scale.y = .43; arm.add(bottom);
  const tattooMaterial = new THREE.MeshBasicMaterial({ map: makeMotifTexture('quetzal'), transparent: true, depthWrite: false, side: THREE.DoubleSide });
  const decal = new THREE.Mesh(new THREE.CylinderGeometry(.958, .668, 4.27, 64, 24, true, -Math.PI * .43, Math.PI * .86), tattooMaterial);
  arm.add(decal);
  const backLight = new THREE.DirectionalLight('#fff0db', 2.4); backLight.position.set(-4, 5, 6); scene.add(backLight);
  const rim = new THREE.DirectionalLight('#e47e5e', 1.8); rim.position.set(4, 0, -3); scene.add(rim);
  scene.add(new THREE.AmbientLight('#ffffff', 1.3));
  watchSize(element, camera, renderer);
  let visible = true; watchVisibility(element, value => visible = value);
  let pressed = false, lastX = 0, targetRotation = .16;
  element.addEventListener('pointerdown', e => {pressed = true; lastX = e.clientX; element.setPointerCapture(e.pointerId);});
  element.addEventListener('pointermove', e => {if (!pressed) return; targetRotation = THREE.MathUtils.clamp(targetRotation + (e.clientX - lastX) * .006, -1.25, 1.25); lastX = e.clientX;});
  element.addEventListener('pointerup', () => pressed = false);
  element.addEventListener('pointercancel', () => pressed = false);
  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    arm.rotation.y += (targetRotation - arm.rotation.y) * .09;
    renderer.render(scene, camera);
  }
  frame();
  return {
    setMotif(motif) { const old = tattooMaterial.map; tattooMaterial.map = makeMotifTexture(motif); tattooMaterial.needsUpdate = true; old.dispose(); },
    setTone(tone) { skin.color.set(tones[tone] || tones.light); },
    reset() { targetRotation = .16; }
  };
}
