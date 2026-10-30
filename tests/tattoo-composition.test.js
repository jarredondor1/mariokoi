import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addTattoo,
  createComposition,
  removeSelectedTattoo,
  updateSelectedTattoo,
} from '../src/tattoo-composition.js';

const anchor = label => ({ point: { label }, normal: { label } });

test('each selected catalog design becomes an independently editable tattoo', () => {
  let composition = createComposition('koi', anchor('chest'));
  composition = addTattoo(composition, 'moth', anchor('arm'));
  composition = addTattoo(composition, 'lotus', anchor('back'));

  assert.equal(composition.items.length, 3);
  assert.deepEqual(composition.items.map(item => item.design), ['koi', 'moth', 'lotus']);
  assert.equal(composition.selectedId, composition.items[2].id);

  composition = updateSelectedTattoo(composition, { size: 65, rotation: 30 });
  assert.equal(composition.items[2].size, 65);
  assert.equal(composition.items[2].rotation, 30);
  assert.equal(composition.items[0].size, 100);
});

test('removing a selected tattoo keeps the other designs on the body', () => {
  let composition = createComposition('koi', anchor('chest'));
  composition = addTattoo(composition, 'moth', anchor('arm'));
  const removedId = composition.selectedId;

  composition = removeSelectedTattoo(composition);

  assert.equal(composition.items.length, 1);
  assert.equal(composition.items[0].design, 'koi');
  assert.notEqual(composition.selectedId, removedId);
});
