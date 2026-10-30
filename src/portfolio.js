// Descriptive labels, not original artwork titles. Sources: public profile grid,
// @mario.koitattoos, reviewed 2026-10-30. Full post captions require Instagram login.
const collections = {
  tattoos: { label: 'Color e ilustración', caption: 'Ilustración, personajes y color sobre la piel.', items: [
    { title: 'Ilustración en la piel', medium: 'Tatuaje ilustrativo', description: 'Líneas definidas, detalles narrativos y acentos de color: una imagen que se descubre de cerca.', image: 'fb3918a35aff6fa2', source: 'https://www.instagram.com/sublimetattoogt/p/Dexe8oDkXUw/', credit: 'Publicado con Sublime Tattoo', style: 'Ilustrativo a color' },
    { title: 'Personajes con carácter', medium: 'Personajes · Color', description: 'Expresiones, siluetas y color para llevar un personaje a una composición sobre el cuerpo.', image: 'ae63e9b4f6d116f7', source: 'https://www.instagram.com/mario.koitattoos/reel/DbEVmAJKEA0/', credit: 'Mario Koi · Instagram', style: 'Personajes / anime' },
  ]},
  nature: { label: 'Naturaleza', caption: 'Flores y quetzales: formas vivas que acompañan al cuerpo.', items: [
    { title: 'Botánica a color', medium: 'Flores · Tatuaje', description: 'Pétalos azules y amarillos en una composición floral que recorre el brazo.', image: '953d4b4113be5183', source: 'https://www.instagram.com/sublimetattoogt/p/DdMstNBkdem/', credit: 'Publicado con Sublime Tattoo', style: 'Botánico / naturaleza' },
    { title: 'El vuelo del quetzal', medium: 'Fauna · Tatuaje', description: 'Plumas verdes, pecho rojo y líneas curvas que prolongan el movimiento del ave.', image: 'e68627a28fa4d65e', source: 'https://www.instagram.com/sublimetattoogt/p/DYXg2VDxDo_/', credit: 'Publicado con Sublime Tattoo', style: 'Botánico / naturaleza' },
  ]},
  murals: { label: 'Murales', caption: 'El dibujo también habita los espacios.', items: [
    { title: 'Magma Coffee', medium: 'Mural · Colaboración', description: 'Figuras, hojas y tonos tierra convierten el muro en parte del ambiente del café.', image: 'b6fbd746dfd84782', source: 'https://www.instagram.com/magmacoffee.gt/reel/DYm1-ZQRzfC/', credit: 'Publicado con Magma Coffee Antigua', style: 'Mural / proyecto artístico' },
  ]},
};

const portrait = { title: 'Retrato en flor', medium: 'Retrato · Color', description: 'Flores, plumas y un perfil enmarcado por detalles rojos. Una composición que acompaña la forma del brazo.', image: '4b2e2bf8a152f09a', source: 'https://www.instagram.com/mario.koitattoos/reel/Cry1WNZO2p7/', credit: 'De mi archivo de tatuajes', style: 'Ilustrativo a color' };
const seated = { title: 'Figura y simbolismo', medium: 'Ilustración · Color', description: 'Una figura sentada, hojas y un tocado verde. El dibujo encuentra su equilibrio en la espalda.', image: '508ddc210fc262fb', source: 'https://www.instagram.com/mario.koitattoos/reel/Cp8Bv-zAAEY/', credit: 'De mi archivo de tatuajes', style: 'Ilustrativo a color' };
const jade = { title: 'Perfil en jade', medium: 'Retrato · Color', description: 'Verdes, turquesas y acentos cálidos en un retrato de líneas marcadas.', image: '068fa2a8f42eb7c1', source: 'https://www.instagram.com/mario.koitattoos/reel/CoDPG60Jmva/', credit: 'De mi archivo de tatuajes', style: 'Ilustrativo a color' };
const monkey = { title: 'Movimiento en color', medium: 'Ilustración · Brazo', description: 'Una figura en movimiento y una cola que dibuja una espiral sobre el hombro.', image: 'cd548ef0b217f6f8', source: 'https://www.instagram.com/mario.koitattoos/reel/DXZzv6pineS/', credit: 'De mi archivo de tatuajes', style: 'Ilustrativo a color' };
const corn = { title: 'Maíz y memoria', medium: 'Detalle · Color', description: 'Una mazorca de muchos colores, trabajada grano a grano junto a otros motivos de la composición.', image: 'fb3e6e6d808a3ea4', source: 'https://www.instagram.com/sublimetattoogt/p/DVzQq10EZft/', credit: 'Publicado con Sublime Tattoo', style: 'Ilustrativo a color' };
const flowers = { title: 'Flores en negro y gris', medium: 'Botánica · Negro y gris', description: 'Pétalos, hojas y sombras suaves que recorren la pierna. Otra manera de trabajar la naturaleza.', image: '4119b794e3042f64', source: 'https://www.instagram.com/sublimetattoogt/reel/DXKzxcCkWpC/', credit: 'Publicado con Sublime Tattoo', style: 'Negro y grises' };
const dragon = { title: 'Dragón sobre el hombro', medium: 'Inspiración japonesa', description: 'Escamas, bigotes y curvas que conectan el pecho con el hombro, trabajados en negro y gris.', image: '25d4d84acff1e223', source: 'https://www.instagram.com/sublimetattoogt/reel/DVOndpREZp1/', credit: 'Publicado con Sublime Tattoo', style: 'Inspiración japonesa' };
collections.tattoos.items.unshift(portrait, seated, jade);
collections.tattoos.items.push(monkey, corn);
collections.nature.items.push(flowers);
collections.black = { label: 'Negro y gris', caption: 'Línea, textura y sombra.', items: [dragon, flowers] };
export const workCollections = {
 all: { label: 'Selección', caption: 'Un recorrido por mis tatuajes y proyectos.', items: [portrait, collections.nature.items[0], dragon, collections.tattoos.items[3], jade, collections.nature.items[1], collections.tattoos.items[4], flowers, seated, monkey, corn, collections.murals.items[0]] },
 tattoos: collections.tattoos, nature: collections.nature, black: collections.black, murals: collections.murals,
};

export const portfolioImage = item => `/images/portfolio/${item.image}.jpg`;
