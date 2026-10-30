import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQuoteMessage, quoteWhatsAppUrl } from '../src/quote-message.js';
test('quote handoff preserves contact, accents, references and the intended WhatsApp recipient', () => {
 const message=buildQuoteMessage({name:'Ana & José', contact:'ana@example.com', idea:'Un quetzal: memoria y raíces',style:'Ilustrativo a color',zone:'Brazo',size:'15 × 10 cm',references:'https://example.com/ref?x=1&y=2'});
 const url=new URL(quoteWhatsAppUrl(message));
 assert.equal(url.hostname,'wa.me'); assert.equal(url.pathname,'/50258232830'); assert.equal(url.searchParams.get('text'),message);
 for(const value of ['Ana & José','ana@example.com','raíces','15 × 10 cm','https://example.com/ref?x=1&y=2']) assert.ok(message.includes(value));
});
test('files are described as pending attachments, and simulator context is included',()=>{
 const message=buildQuoteMessage({name:'Prueba',contact:'prueba@example.com',idea:'Flores',files:['mi-idea-mario-koi.png'],simulator:'Modelo: mujer. Vista: Brazo.'});
 assert.match(message,/Imágenes que adjuntaré en este chat/); assert.match(message,/mi-idea-mario-koi.png/); assert.match(message,/Modelo: mujer/); assert.doesNotMatch(message,/blob:|data:image/);
});
test('tentative appointment preserves date and Guatemala time without implying confirmation', () => {
 const message=buildQuoteMessage({preferredDate:'2026-11-20',preferredTime:'14:30'});
 assert.match(message,/Fecha tentativa: 20\/11\/2026/);
 assert.match(message,/Hora tentativa \(Guatemala\): 14:30/);
 assert.match(message,/sujetas a disponibilidad y confirmación/);
 const url=new URL(quoteWhatsAppUrl(message));
 assert.equal(url.searchParams.get('text'),message);
});
test('appointment can remain undecided or provide only a date', () => {
 const empty=buildQuoteMessage({});
 assert.match(empty,/Fecha tentativa: Por definir/);
 assert.match(empty,/Hora tentativa \(Guatemala\): Por definir/);
 const dateOnly=buildQuoteMessage({preferredDate:'2026-12-01'});
 assert.match(dateOnly,/Fecha tentativa: 01\/12\/2026/);
 assert.match(dateOnly,/Hora tentativa \(Guatemala\): Por definir/);
});
