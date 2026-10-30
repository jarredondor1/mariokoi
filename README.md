# Mario Koi — La tinta está viva

Sitio del artista Mario Ochoa Salguero (Koi), construido con Vite y Three.js.

## Experiencia

- Entrada ilustrada y peces koi 3D que acompañan el recorrido.
- Perfil del artista con capítulos interactivos.
- Portafolio con filtros, galería 3D, presentación automática y vista ampliada.
- Simulador de tatuajes: cuerpos femenino y masculino, tres tonos de piel, selección de zonas, múltiples diseños de ejemplo e imágenes propias. Permite seleccionar, mover, girar, redimensionar y eliminar cada pieza, además de guardar la vista.
- Formulario de cotización con contacto, idea, estilo, referencias y fecha y hora tentativas. Prepara un mensaje para WhatsApp; el cliente confirma su envío y adjunta las imágenes en WhatsApp. La solicitud no confirma una cita.

## Desarrollo local

```sh
npm ci
npm run dev
```

Para validar la compilación en el puerto usado durante el desarrollo:

```sh
npm test
npm run build
npm run preview -- --port 4173
```

Abrir http://127.0.0.1:4173/. La compilación estática se genera en `dist/` y puede publicarse en un alojamiento estático. `node_modules/` y `dist/` no se incluyen en Git.

## Organización

- `src/`: interfaz, estilos, galería, escenas y simulador.
- `public/`: imágenes, diseños y modelos utilizados por el sitio.
- `assets/`: fuentes editables de los modelos y licencias.
- `scripts/` y `tools/`: preparación de modelos.
- `tests/`: comprobaciones de movimiento, composición y mensajes.
- Las capturas de la raíz documentan revisiones visuales del desarrollo.

## Modelos y procedencia

Las cuatro ediciones de koi están en `assets/ornamental-school.blend`; los archivos listos para la web están en `public/models/`. Los scripts de Blender requieren el STL original proporcionado por el usuario, cuya ruta está configurada en `tools/prepare-stl-koi.py`.

Los maniquíes pueden reconstruirse con `node scripts/create-mannequins.mjs` utilizando las fuentes incluidas. Los diseños del simulador son ejemplos, no obras atribuidas al artista.

Consulta [ASSET_CREDITS.md](ASSET_CREDITS.md) para las referencias y licencias.
