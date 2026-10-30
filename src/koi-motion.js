import * as THREE from 'three';

const bounds = new THREE.Vector3(3.8, 14, 1.75);
const startingPoints = [
  { position: [-2.7, 1.25, .65], velocity: [.34, -.06, -.08], pace: .56, space: 1.25 },
  { position: [2.55, 1.25, -.85], velocity: [-.24, -.2, .12], pace: .68, space: 1.2 },
  { position: [-.2, 2, -1.25], velocity: [.32, -.08, .12], pace: .62, space: 1.05 },
  { position: [2.4, -1.65, .95], velocity: [-.32, .18, -.12], pace: .72, space: 1.15 },
  { position: [-1.65, -.45, -.25], velocity: [.42, .06, .04], pace: .84, space: .58 },
  { position: [3.05, -.15, 1.25], velocity: [-.4, -.12, -.08], pace: .9, space: .54 },
];
const forageZones = [
  [-3, 1.25, .55], [-1.8, -.9, -.6], [-.15, 1.75, .9],
  [2.45, 1.2, -.95], [3, -.95, .7], [.2, -1.8, -1.15],
];
const twoPi = Math.PI * 2;

export function createKoiMotion() {
  return startingPoints.map((start, index) => ({
    position: new THREE.Vector3(...start.position),
    velocity: new THREE.Vector3(...start.velocity),
    target: new THREE.Vector3(...start.position),
    pace: start.pace,
    space: start.space,
    phase: index * twoPi / startingPoints.length,
    age: 0,
    heading: Math.atan2(start.velocity[1], start.velocity[0]),
    turn: 0,
    speedFactor: 1,
  }));
}

export function pageCurrentOffset(journeyUnits) {
  return journeyUnits - Math.tanh(journeyUnits * .15) * .55;
}

function targetFor(index, time, mode, target) {
  const phase = index * twoPi / startingPoints.length;
  if (mode === 0) {
    // Tight, coordinated school: a shared turn in response to danger.
    const angle = phase + time * .3;
    const centerX = Math.sin(time * .14) * .65;
    const centerY = Math.cos(time * .12) * .35;
    target.set(centerX + Math.cos(angle) * 1.82,
      centerY + Math.sin(angle) * 1.18,
      Math.sin(angle * 2 + time * .12) * .4);
  } else if (mode === 1) {
    // Six separate feeding patches, each searched in a gentle looping sweep.
    const [x, y, z] = forageZones[index];
    const scan = time * (.48 + index * .012) + phase;
    target.set(x + Math.cos(scan) * .48,
      y + Math.sin(scan * 1.18) * .38,
      z + Math.sin(scan * .62) * .32);
  } else {
    // Two quiet depth bands follow the slowly changing water temperature.
    const group = index < 3 ? 0 : 1;
    const lane = index % 3 - 1;
    const season = Math.sin(time * .035);
    const warmLayer = THREE.MathUtils.lerp(-.65, .8, (season + 1) * .5);
    const z = group === 0 ? warmLayer + .15 : warmLayer - .75;
    target.set(lane * 1.35 + Math.sin(time * .16 + group) * .36,
      (group === 0 ? .82 : -.76) + Math.cos(time * .18 + lane) * .16,
      z + Math.sin(time * .21 + index) * .12);
  }
  return target;
}

export function advanceKoiMotion(school, delta, time, xSpan = 1, ySpan = 1) {
  const snapshots = school.map(fish => ({ position: fish.position.clone(), velocity: fish.velocity.clone() }));
  const previousTarget = new THREE.Vector3();
  const nextTarget = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const away = new THREE.Vector3();
  const separation = new THREE.Vector3();
  const averageVelocity = new THREE.Vector3();
  const modePosition = ((time % 15) + 15) % 15;
  const mode = Math.floor(modePosition / 5);
  const transition = THREE.MathUtils.smoothstep(modePosition % 5, 0, 1.05);
  const fromMode = time < 1.05 ? mode : (mode + 2) % 3;
  const modeSpeed = mode === 0 ? 1.16 : mode === 1 ? .83 : .68;

  school.forEach((fish, index) => {
    fish.age += delta;
    targetFor(index, time, fromMode, previousTarget);
    targetFor(index, time, mode, nextTarget);
    fish.target.lerpVectors(previousTarget, nextTarget, transition);

    direction.copy(fish.target).sub(fish.position);
    separation.set(0, 0, 0);
    averageVelocity.set(0, 0, 0);
    for (let otherIndex = 0; otherIndex < school.length; otherIndex++) {
      if (otherIndex === index) continue;
      const other = school[otherIndex];
      away.copy(snapshots[index].position).sub(snapshots[otherIndex].position);
      const screenDistance = Math.hypot(away.x * xSpan, away.y * ySpan);
      const clearance = fish.space + other.space;
      if (screenDistance > .01 && screenDistance < clearance) {
        away.set(away.x / Math.max(xSpan, .35), away.y, away.z * .07).normalize();
        separation.addScaledVector(away, (1 - screenDistance / clearance) * .8);
      }
      if (mode === 0 && screenDistance < 3.2) averageVelocity.add(snapshots[otherIndex].velocity);
    }
    // Normalize the destination pull before adding flocking forces; otherwise a
    // distant target overwhelms separation and the fish collapse into a pile.
    direction.normalize();
    direction.addScaledVector(separation, 1.25);
    if (mode === 0 && averageVelocity.lengthSq() > .001) {
      direction.addScaledVector(averageVelocity.normalize(), .18);
    }
    for (const axis of ['x', 'y', 'z']) {
      const softEdge = bounds[axis] * .8;
      if (Math.abs(fish.position[axis]) > softEdge) {
        direction[axis] -= Math.sign(fish.position[axis]) *
          (Math.abs(fish.position[axis]) - softEdge) * .9;
      }
    }
    direction.x += Math.sin(fish.age * .68 + fish.phase) * .035;
    direction.y += Math.cos(fish.age * .54 + fish.phase) * .032;
    direction.z += Math.sin(fish.age * .48 + fish.phase) * .025;
    if (direction.lengthSq() < .001) direction.copy(fish.velocity);
    direction.normalize();

    const distance = fish.position.distanceTo(fish.target);
    const cruise = fish.pace * modeSpeed;
    const targetSpeed = cruise * (distance < .45 ? Math.max(.55, distance / .45) : 1);
    const currentSpeed = fish.velocity.length();
    const nextSpeed = THREE.MathUtils.damp(currentSpeed, targetSpeed, 1.65, delta);
    const currentDirection = fish.velocity.clone().normalize();
    currentDirection.lerp(direction, 1 - Math.exp(-1.45 * delta)).normalize();
    fish.velocity.copy(currentDirection).multiplyScalar(nextSpeed);
    fish.position.addScaledVector(fish.velocity, delta);

    for (const axis of ['x', 'y', 'z']) {
      if (Math.abs(fish.position[axis]) > bounds[axis]) {
        fish.position[axis] = Math.sign(fish.position[axis]) * bounds[axis];
        fish.velocity[axis] *= -.35;
      }
    }
    const heading = Math.atan2(fish.velocity.y * ySpan, fish.velocity.x * xSpan);
    fish.turn = Math.atan2(Math.sin(heading - fish.heading), Math.cos(heading - fish.heading)) / Math.max(delta, .001);
    fish.heading = heading;
    fish.speedFactor = fish.velocity.length() / Math.max(fish.pace, .01);
  });
}
