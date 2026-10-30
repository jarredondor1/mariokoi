export const MARIO_WHATSAPP = '50258232830';
export function buildQuoteMessage(data) {
  const line = (label, value) => `${label}: ${String(value || '').trim() || 'Por definir'}`;
  return [
    'Hola Mario, me gustaría cotizar una pieza.', '',
    line('Nombre', data.name), line('Contacto para seguimiento', data.contact), '',
    line('Qué quiero representar', data.idea), line('Estilo', data.style),
    line('Zona del cuerpo o superficie', data.zone), line('Tamaño aproximado', data.size),
    '', line('Fecha tentativa', data.preferredDate ? data.preferredDate.split('-').reverse().join('/') : ''),
    line('Hora tentativa (Guatemala)', data.preferredTime),
    'Fecha y hora sujetas a disponibilidad y confirmación.',
    ...(data.references?.trim() ? ['', 'Referencias (enlaces):', data.references.trim()] : []),
    ...(data.simulator ? ['', 'Idea en el simulador 3D:', data.simulator, 'La vista es orientativa; el diseño final se trabaja contigo.'] : []),
    ...(data.files?.length ? ['', 'Imágenes que adjuntaré en este chat:', ...data.files.map(name => `• ${name}`)] : []),
  ].join('\n');
}
export function quoteWhatsAppUrl(message) {
  return `https://wa.me/${MARIO_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
