import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { advanceKoiMotion, createKoiMotion, pageCurrentOffset } from './koi-motion.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const editions = ['oro', 'kohaku', 'sumi', 'jade', 'kohaku', 'sumi'];
const sizes = { wide: [.72,.55,.46,.52,.36,.31], compact: [.56,.43,.37,.42,.3,.26], narrow: [.4,.32,.28,.32,.23,.2] };
const waterVertex = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const waterFragment = `
  varying vec2 vUv; uniform float uTime; uniform vec2 uPointer;
  void main() {
    vec2 p = (vUv - .5) * vec2(1.8, 1.0);
    float radial = length(p - vec2(.09, .05));
    float pulse = sin(radial * 34.0 - uTime * .9) * exp(-radial * 2.2);
    float wandering = sin(p.x * 17.0 + sin(p.y * 12.0 + uTime * .13)) * sin(p.y * 13.0 - uTime * .18);
    float pointerLight = exp(-length(p - uPointer * vec2(.55, .35)) * 5.0);
    float ink = .014 * pulse + .006 * wandering + .02 * pointerLight;
    vec3 deep = vec3(.011, .038, .035);
    vec3 pale = vec3(.057, .105, .087);
    float glow = exp(-radial * 1.25) * .47 + ink;
    float vignette = 1.0 - smoothstep(.17, 1.18, length((vUv - .5) * vec2(1.22, 1.0)));
    gl_FragColor = vec4(mix(deep, pale, clamp(glow, 0.0, 1.0)) * (.67 + .33 * vignette), 1.0);
  }
`;

export function mountKoiWorld(element, status, onReady = () => {}, workSection) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); }
  catch { status.textContent = 'La escena 3D no está disponible en este navegador.'; onReady(); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.38;
  element.appendChild(renderer.domElement);
  renderer.domElement.tabIndex = -1;
  renderer.domElement.style.pointerEvents = 'none';
  renderer.domElement.setAttribute('aria-label', 'Seis koi ornamentales nadan libremente en un estanque tridimensional.');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#06120f');
  const camera = new THREE.PerspectiveCamera(39, 1, .1, 70);
  camera.position.set(0, .25, 9.3);
  const cameraTarget = new THREE.Vector3(0, .25, 0);

  // The enclosing shader stays visible from every camera angle.
  const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertex, fragmentShader: waterFragment,
    uniforms: { uTime: { value: 0 }, uPointer: { value: new THREE.Vector2() } },
    side: THREE.BackSide, depthWrite: false,
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(28, 48, 32), waterMaterial));
  const rings = [1.25, 2, 2.9, 3.9].map(radius => {
    const mesh = new THREE.Mesh(new THREE.RingGeometry(radius, radius + .003, 160),
      new THREE.MeshBasicMaterial({ color: '#758f82', transparent: true, opacity: .09, side: THREE.DoubleSide, depthWrite: false }));
    mesh.position.set(.55, .45, -2.5);
    mesh.scale.y = .78;
    scene.add(mesh);
    return mesh;
  });
  const ripples = Array.from({ length: 20 }, () => {
    const mesh = new THREE.Mesh(new THREE.RingGeometry(1, 1.008, 96),
      new THREE.MeshBasicMaterial({ color: '#d5ad75', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
    mesh.visible = false;
    scene.add(mesh);
    return { mesh, age: 10, duration: 1.65, strength: .25 };
  });
  let nextRipple = 0;
  function rippleAt(position, strength = .25) {
    const ripple = ripples[nextRipple++ % ripples.length];
    ripple.mesh.position.copy(position);
    ripple.mesh.position.z -= .36;
    ripple.age = 0;
    ripple.strength = strength;
    ripple.mesh.visible = true;
  }

  let seed = 193;
  const random = () => ((seed = seed * 16807 % 2147483647) - 1) / 2147483646;
  const sparkPositions = [];
  for (let index = 0; index < 230; index++) sparkPositions.push((random()-.5)*13, (random()-.5)*8, (random()-.5)*5);
  const sparkGeometry = new THREE.BufferGeometry();
  sparkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(sparkPositions, 3));
  const sparks = new THREE.Points(sparkGeometry,
    new THREE.PointsMaterial({ color: '#bca37e', size: .017, transparent: true, opacity: .34, depthWrite: false }));
  scene.add(sparks);
  scene.add(new THREE.AmbientLight('#d9fff0', .75));
  const key = new THREE.DirectionalLight('#ffe8c4', 2.8); key.position.set(-3, 5, 6); scene.add(key);
  const rim = new THREE.DirectionalLight('#64baa7', 2.1); rim.position.set(4, -2, 3); scene.add(rim);
  const ember = new THREE.DirectionalLight('#ce694c', .9); ember.position.set(1, 2, -1); scene.add(ember);

  const fishes = [];
  const motionSchool = createKoiMotion();
  const loader = new GLTFLoader();
  let settled = 0;
  let failed = false;
  const finishOne = () => {
    settled++;
    if (settled === editions.length) {
      status.textContent = ''; // The entry can still open if one optional model fails.
      onReady();
    }
  };
  status.textContent = 'El estanque despierta…';
  for (const [index, slug] of editions.entries()) {
    const group = new THREE.Group(); scene.add(group);
    const fish = {
      group, ready: false, wakeAt: 0, motion: motionSchool[index],
      swimTime: { value: index * 1.7 }, swimAmp: { value: 0 },
    };
    fishes.push(fish);
    loader.load(`${import.meta.env.BASE_URL}models/ornamental-${slug}.glb`, gltf => {
      gltf.scene.rotation.x = Math.PI / 2;
      gltf.scene.traverse(object => {
        if (!object.isMesh) return;
        const material = object.material.clone();
        material.side = THREE.DoubleSide;
        material.onBeforeCompile = shader => {
          shader.uniforms.uSwimTime = fish.swimTime;
          shader.uniforms.uSwimAmp = fish.swimAmp;
          shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nuniform float uSwimTime;\nuniform float uSwimAmp;');
          shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
            '#include <begin_vertex>\nfloat tailWeight = pow(clamp((.75 - position.x) / 2.15, 0.0, 1.0), 1.8);\nfloat swimWave = sin(uSwimTime * 4.3 - position.x * 2.9);\ntransformed.z += swimWave * uSwimAmp * tailWeight;\ntransformed.y += cos(uSwimTime * 4.3 - position.x * 2.9) * uSwimAmp * tailWeight * .18;');
        };
        material.customProgramCacheKey = () => 'ornamental-swim-v1';
        object.material = material;
        object.frustumCulled = false;
      });
      group.add(gltf.scene);
      fish.ready = true;
      finishOne();
    }, undefined, error => {
      failed = true;
      finishOne();
      console.error('No se pudo cargar el koi', slug, error);
    });
  }

  let layout = 'wide', xSpan = 1, ySpan = 1;
  let viewHeight = 0;
  function resize() {
    const width = Math.max(1, element.clientWidth), height = Math.max(1, element.clientHeight);
    layout = width < 500 ? 'narrow' : width < 800 ? 'compact' : 'wide';
    xSpan = layout === 'narrow' ? .2 : layout === 'compact' ? .65 : 1;
    ySpan = layout === 'narrow' ? .87 : layout === 'compact' ? .9 : 1;
    camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height);
    viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * .5)) * camera.position.z;
    for (const ring of rings) ring.position.x = layout === 'wide' ? .55 : 0;
  }
  new ResizeObserver(resize).observe(element);
  resize();

  const pointer = new THREE.Vector2();

  const clock = new THREE.Clock();
  let elapsed = 0, visible = true;
  new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? true; }).observe(element);
  function frame() {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) { clock.getDelta(); return; }
    const delta = Math.min(.05, clock.getDelta());
    elapsed += delta;
    const time = reducedMotion ? 0 : elapsed;
    waterMaterial.uniforms.uTime.value = time;
    waterMaterial.uniforms.uPointer.value.copy(pointer);
    sparks.rotation.z = Math.sin(time * .09) * .025;
    sparks.position.y = Math.sin(time * .19) * .06;
    const viewportHeight = Math.max(1, element.clientHeight);
    const journeyUnits = window.scrollY / viewportHeight * viewHeight;
    const desiredTargetY = .25 - journeyUnits;
    cameraTarget.y = reducedMotion ? desiredTargetY : THREE.MathUtils.damp(cameraTarget.y, desiredTargetY, 3.1, delta);
    camera.position.set(
      reducedMotion ? 0 : Math.sin(time * .09) * .18,
      cameraTarget.y + (reducedMotion ? 0 : .12 + Math.sin(time * .13) * .1),
      9.3,
    );
    camera.lookAt(cameraTarget);
      if (!reducedMotion) advanceKoiMotion(motionSchool, delta, time, xSpan, ySpan);
    // Keep the school in the same moving water as the page. A small lag lets
    // the koi drift across each section without disappearing while the camera follows a scroll.
    const flowingOffset = pageCurrentOffset(.25 - cameraTarget.y);
    fishes.forEach((fish, index) => {
      if (!fish.ready) return;
      const motion = fish.motion;
      const sway = reducedMotion ? 0 : Math.sin(time * 1.3 + index * 1.8) * .035;
      fish.group.position.set(motion.position.x * xSpan, motion.position.y * ySpan - flowingOffset + sway, motion.position.z);
      fish.group.scale.setScalar(sizes[layout][index]);
      fish.group.rotation.set(
        THREE.MathUtils.clamp(-motion.turn * .15, -.18, .18) + Math.sin(time * 1.1 + index) * .04,
        THREE.MathUtils.clamp(-motion.velocity.z * .28, -.25, .25),
        motion.heading + Math.sin(time * 2.2 + index) * .025,
      );
      fish.swimTime.value += delta * (1 + motion.speedFactor * .65);
      fish.swimAmp.value = reducedMotion ? 0 : .11 + motion.speedFactor * .055 + Math.min(1, Math.abs(motion.turn)) * .04;
      if (!reducedMotion && time > fish.wakeAt) {
        rippleAt(fish.group.position, .16 + motion.speedFactor * .045);
        fish.wakeAt = time + .95 - Math.min(.25, motion.speedFactor * .12) + index * .08;
      }
    });
    for (const ripple of ripples) {
      if (!ripple.mesh.visible) continue;
      ripple.age += delta;
      const progress = ripple.age / ripple.duration;
      ripple.mesh.scale.setScalar(.07 + progress * (.55 + ripple.strength));
      ripple.mesh.material.opacity = Math.max(0, ripple.strength * .5 * (1 - progress));
      if (progress >= 1) ripple.mesh.visible = false;
    }
    renderer.render(scene, camera);
  }
  frame();
}
