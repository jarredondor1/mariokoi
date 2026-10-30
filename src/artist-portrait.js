export function mountArtistPortrait(root) {
  const tabs = [...root.querySelectorAll('[data-portrait-view]')];
  const panels = [...root.querySelectorAll('[data-portrait-panel]')];
  const captions = ['Mario, en el estudio', 'El trazo, de cerca', 'Una pieza sobre la piel'];
  function select(index) {
    root.dataset.portraitView = tabs[index].dataset.portraitView;
    tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', i === index); tab.tabIndex = i === index ? 0 : -1; });
    panels.forEach((panel, i) => panel.hidden = i !== index);
    root.querySelector('.artist-photo-caption').textContent = captions[index];
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', event => {
      let next;
      if(event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if(event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if(event.key === 'Home') next = 0;
      if(event.key === 'End') next = tabs.length - 1;
      if(next !== undefined) {event.preventDefault();select(next);tabs[next].focus();}
    });
  });
  const stage = root.querySelector('.artist-visual');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, x = 0, y = 0;
  const paint = () => {frame=0;stage.style.setProperty('--rx', `${y * -3}deg`);stage.style.setProperty('--ry', `${x * 5}deg`);};
  stage.addEventListener('pointermove', event => {
    if(reduced.matches || event.pointerType !== 'mouse') return;
    const rect=stage.getBoundingClientRect(); x=(event.clientX-rect.left)/rect.width-.5;y=(event.clientY-rect.top)/rect.height-.5;
    if(!frame) frame=requestAnimationFrame(paint);
  });
  stage.addEventListener('pointerleave', () => {x=y=0;if(!frame)frame=requestAnimationFrame(paint);});
  reduced.addEventListener('change', () => {x=y=0;paint();});
}
