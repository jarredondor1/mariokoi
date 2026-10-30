import { buildQuoteMessage, quoteWhatsAppUrl } from './quote-message.js';
const closeIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg>';
export const quoteMarkup = `
<dialog class="quote-dialog" aria-labelledby="quote-title">
 <div class="quote-top"><div><h2 id="quote-title">Cuéntame tu idea.</h2><p>El primer trazo lo ponemos en palabras.</p></div><button class="quote-close" type="button" aria-label="Cerrar cotización">${closeIcon}</button></div>
 <form class="quote-form">
  <div class="quote-pair"><label>Tu nombre<input name="name" autocomplete="name" required maxlength="80" placeholder="¿Cómo te llamas?"></label><label>Tu contacto<input name="contact" autocomplete="tel" required maxlength="100" placeholder="WhatsApp o correo"></label></div>
  <label>¿Qué quieres representar?<textarea name="idea" required minlength="8" maxlength="1200" rows="3" placeholder="Cuéntame la historia, el motivo o lo que te gustaría transmitir."></textarea></label>
  <label>¿Qué estilo buscas?<select name="style"><option>Quiero que Mario me oriente</option><option>Ilustrativo a color</option><option>Personajes / anime</option><option>Botánico / naturaleza</option><option>Inspiración japonesa</option><option>Negro y grises</option><option>Mural / proyecto artístico</option><option>Otro estilo</option></select></label>
  <div class="quote-pair"><label>Zona o superficie <small>Opcional</small><input name="zone" maxlength="100" placeholder="Antebrazo, espalda, muro…"></label><label>Tamaño aproximado <small>Opcional</small><input name="size" maxlength="80" placeholder="Ej. 15 × 10 cm"></label></div>
  <div class="quote-appointment">
   <div class="quote-pair"><label>Fecha tentativa <small>Opcional</small><input type="date" name="preferredDate" aria-describedby="quote-appointment-note"></label><label>Hora tentativa <small>Opcional</small><input type="time" name="preferredTime" aria-describedby="quote-appointment-note"></label></div>
   <p id="quote-appointment-note">Hora de Guatemala. Es una preferencia: la cita queda pendiente hasta que confirmemos juntos la disponibilidad.</p>
  </div>
  <details class="quote-references" open><summary>Referencias y bocetos <span>Opcional</span></summary>
   <label>Enlaces de imágenes o publicaciones<textarea name="references" maxlength="900" rows="2" placeholder="Pega hasta 3 enlaces, uno por línea."></textarea></label>
   <div class="quote-upload-row"><button type="button" data-quote-upload>Añadir imágenes</button><span>Hasta 4 · JPG, PNG o WebP · 10 MB cada una</span><input type="file" class="quote-file-input" accept="image/jpeg,image/png,image/webp" multiple hidden></div>
   <div class="quote-files"></div>
   <p class="quote-attachment-note">Los enlaces se incluirán en el mensaje. Las imágenes las adjuntas después en el chat de WhatsApp.</p>
  </details>
  <div class="quote-simulator"><p>También puedes mostrar dónde lo imaginas.</p><div><button type="button" data-quote-capture>Incluir mi vista 3D</button><a href="#prueba" data-quote-sim>Ir al simulador</a></div><p class="quote-capture-summary" hidden></p></div>
  <p class="quote-error" role="alert" hidden></p>
  <div class="quote-form-bottom"><p>Revisa tu solicitud antes de abrir WhatsApp. Nada se envía automáticamente.</p><button class="quote-primary" type="submit">Preparar solicitud <span aria-hidden="true">→</span></button></div>
 </form>
 <section class="quote-review" aria-labelledby="quote-review-title" hidden>
  <h3 id="quote-review-title">Así comienza la conversación.</h3><pre class="quote-message"></pre>
  <p class="quote-review-note">El mensaje está listo. WhatsApp se abrirá con los datos; pulsa Enviar en el chat para hacerme llegar tu idea.</p>
  <div class="quote-next"><h4>¿Qué sigue?</h4><p>Envía tu solicitud y conversemos por WhatsApp sobre el diseño, el precio y la disponibilidad. Antes de reservar, acordaremos los detalles y las condiciones de tu cita.</p></div>
  <div class="quote-review-files"></div>
  <a class="quote-primary quote-send" target="_blank" rel="noopener noreferrer">Abrir WhatsApp <span aria-hidden="true">↗</span></a>
  <button class="quote-back" type="button">Volver a editar</button>
 </section>
</dialog>`;

export function mountQuote(capturePreview) {
 const dialog = document.querySelector('.quote-dialog'), form = dialog.querySelector('form');
 const review = dialog.querySelector('.quote-review'), error = dialog.querySelector('.quote-error');
 const files = []; let simulator = '', captureFile = null, captureBusy = false, uploadBusy = false;
 const showError = message => { error.textContent = message; error.hidden = !message; };
 const today = () => new Intl.DateTimeFormat('en-CA', {timeZone:'America/Guatemala',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const resetReview = () => { form.hidden = false; review.hidden = true; };
 const updateBusy = () => { form.querySelector('[type="submit"]').disabled = captureBusy || uploadBusy; };
 const renderFiles = () => {
  const list = dialog.querySelector('.quote-files'); list.replaceChildren();
  files.forEach(entry => {
   const tile = document.createElement('div'); tile.className = 'quote-file';
   const image = document.createElement('img'); image.src = entry.url; image.alt = entry.file.name;
   const name = document.createElement('span'); name.textContent = entry.file.name;
   const remove = document.createElement('button'); remove.type = 'button'; remove.innerHTML = closeIcon; remove.setAttribute('aria-label', `Quitar ${entry.file.name}`);
   remove.addEventListener('click', () => {
    files.splice(files.indexOf(entry), 1); URL.revokeObjectURL(entry.url);
    if (entry === captureFile) { captureFile = null; simulator = ''; dialog.querySelector('.quote-capture-summary').hidden = true; }
    renderFiles();
   });
   tile.append(image, name, remove); list.append(tile);
  });
 };
 const capture = async () => {
  if (captureBusy) return;
  captureBusy = true; updateBusy(); showError('');
  const button = dialog.querySelector('[data-quote-capture]'); button.disabled = true; button.textContent = 'Preparando vista…';
  try {
   if (files.length >= 4 && !captureFile) throw new Error('Puedes incluir hasta 4 imágenes. Quita una antes de añadir la vista 3D.');
   const result = await capturePreview();
   if (!result) throw new Error('Primero crea una composición en el simulador. Después vuelve con “Consultar esta idea”.');
   if (captureFile) { files.splice(files.indexOf(captureFile),1); URL.revokeObjectURL(captureFile.url); }
   captureFile = {file:result.file,url:URL.createObjectURL(result.file)}; files.push(captureFile); simulator = result.summary;
   if (!form.elements.zone.value && result.zone !== 'Cuerpo') form.elements.zone.value = result.zone || '';
   const summary = dialog.querySelector('.quote-capture-summary'); summary.textContent = 'Vista 3D incluida como referencia. Podrás descargarla para adjuntarla al chat.'; summary.hidden = false; renderFiles();
  } catch (err) { showError(err.message); }
  finally { captureBusy = false; button.disabled = false; button.textContent = 'Incluir mi vista 3D'; updateBusy(); }
 };
 document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-open-quote]'); if (!trigger) return;
  event.preventDefault(); resetReview(); showError('');
  form.elements.preferredDate.min = today();
  if (trigger.dataset.quoteStyle) form.elements.style.value = trigger.dataset.quoteStyle;
  if (trigger.dataset.quoteReference) {
   const current = form.elements.references.value.split(/\s+/).filter(Boolean);
   if (!current.includes(trigger.dataset.quoteReference) && current.length < 3) form.elements.references.value = [...current,trigger.dataset.quoteReference].join('\n');
  }
  dialog.showModal(); document.body.classList.add('is-quote-open');
  if (trigger.hasAttribute('data-with-preview')) capture();
 });
 dialog.querySelector('.quote-close').addEventListener('click', () => dialog.close());
 dialog.addEventListener('close', () => document.body.classList.remove('is-quote-open'));
 dialog.addEventListener('click', event => { if (event.target === dialog) { const r=dialog.getBoundingClientRect(); if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) dialog.close(); } });
 dialog.querySelector('[data-quote-sim]').addEventListener('click', () => dialog.close());
 dialog.querySelector('[data-quote-capture]').addEventListener('click', capture);
 const input = dialog.querySelector('.quote-file-input');
 dialog.querySelector('[data-quote-upload]').addEventListener('click', () => input.click());
 input.addEventListener('change', async () => {
  uploadBusy = true; updateBusy(); showError('');
  const issues = [];
  for (const file of [...input.files]) {
   if (files.length >= 4) { issues.push('El máximo es 4 imágenes.'); break; }
   if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 10*1024*1024) { issues.push(`${file.name}: usa JPG, PNG o WebP de hasta 10 MB.`); continue; }
   const url = URL.createObjectURL(file);
   try { const image = new Image(); image.src = url; await image.decode(); files.push({file,url}); }
   catch { URL.revokeObjectURL(url); issues.push(`No pudimos leer ${file.name}. Prueba otra imagen.`); }
  }
  input.value = ''; renderFiles(); showError(issues.join(' ')); uploadBusy = false; updateBusy();
 });
 form.addEventListener('submit', event => {
  event.preventDefault(); if (captureBusy || uploadBusy) return; showError('');
  const data = Object.fromEntries(new FormData(form));
  if (!data.name.trim() || !data.contact.trim() || data.idea.trim().length < 8) { showError('Escribe tu nombre, un contacto y una descripción de al menos 8 caracteres.'); return; }
  if (data.preferredDate && data.preferredDate < today()) { showError('Elige una fecha tentativa de hoy en adelante.'); form.elements.preferredDate.focus(); return; }
  const refs = data.references.trim().split(/\s+/).filter(Boolean);
  if (refs.length > 3 || refs.some(ref => { try { return !['http:','https:'].includes(new URL(ref).protocol); } catch { return true; } })) { showError('Usa hasta 3 enlaces completos de referencia, comenzando por https:// o http://.'); form.elements.references.focus(); return; }
  const message = buildQuoteMessage({...data, references:refs.join('\n'), simulator, files:files.map(entry=>entry.file.name)});
  review.querySelector('.quote-message').textContent = message;
  review.querySelector('.quote-send').href = quoteWhatsAppUrl(message);
  const downloads = review.querySelector('.quote-review-files'); downloads.replaceChildren();
  if (files.length) {
   const note = document.createElement('p'); note.textContent = 'Adjunta estas imágenes en WhatsApp. Puedes guardarlas aquí:'; downloads.append(note);
   files.forEach(entry => { const a=document.createElement('a'); a.href=entry.url; a.download=entry.file.name; a.textContent=`Descargar ${entry.file.name}`; downloads.append(a); });
  }
  form.hidden=true; review.hidden=false; dialog.scrollTop=0; review.querySelector('.quote-send').focus();
 });
 dialog.querySelector('.quote-back').addEventListener('click', () => { resetReview(); form.elements.name.focus(); });
}
