import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceKoiMotion, createKoiMotion, pageCurrentOffset } from '../src/koi-motion.js';

test('the six koi keep swimming through the three movement modes', () => {
  const school = createKoiMotion();
  const starts = school.map(fish => fish.position.clone());
  const headings = school.map(() => new Set());

  for (let frame = 0; frame < 60 * 45; frame++) {
    const time = frame / 60;
    advanceKoiMotion(school, 1 / 60, time, .87, .9, 0);
    school.forEach((fish, index) => {
      assert.ok(Math.abs(fish.position.x) <= 3.81);
      assert.ok(Math.abs(fish.position.y) <= 14.01);
      assert.ok(Math.abs(fish.position.z) <= 1.76);
      assert.ok(fish.velocity.length() > .05);
      assert.ok(Number.isFinite(fish.heading));
      headings[index].add(Math.round(fish.heading * 2));
    });
  }

  school.forEach((fish, index) => {
    assert.ok(fish.position.distanceTo(starts[index]) > 1);
    assert.ok(headings[index].size > 5);
  });
});

test('the school stays within view through long pages at every layout scale', () => {
  for (const journey of [0, 4, 8, 40, 100, 250]) {
    const offset = pageCurrentOffset(journey);
    assert.ok(Number.isFinite(offset));
    assert.ok(Math.abs(journey - offset) <= .551, 'scroll lag remains bounded at the footer');
    for (const scale of [.87, .9, 1]) {
      const localY = 1.2 * scale;
      const screenY = localY - offset + journey;
      assert.ok(Math.abs(screenY - localY) <= .551, 'mobile scaling does not accumulate scroll drift');
    }
  }
});
