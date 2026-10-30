let nextId = 1;

const makeTattoo = (design, anchor, offset = 0) => ({
  id: `tattoo-${nextId++}`,
  design,
  anchor,
  size: 100,
  rotation: 0,
  offset,
});

export function createComposition(design, anchor) {
  const tattoo = makeTattoo(design, anchor);
  return { items: [tattoo], selectedId: tattoo.id };
}

export function addTattoo(composition, design, anchor) {
  const tattoo = makeTattoo(design, anchor, composition.items.length);
  return { items: [...composition.items, tattoo], selectedId: tattoo.id };
}

export function selectTattoo(composition, id) {
  if (!composition.items.some(item => item.id === id)) return composition;
  return { ...composition, selectedId: id };
}

export function updateSelectedTattoo(composition, changes) {
  return {
    ...composition,
    items: composition.items.map(item => item.id === composition.selectedId ? { ...item, ...changes } : item),
  };
}

export function removeSelectedTattoo(composition) {
  const items = composition.items.filter(item => item.id !== composition.selectedId);
  return { items, selectedId: items.at(-1)?.id ?? null };
}
