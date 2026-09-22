#!/usr/bin/env node
/**
 * Servidor estático para ver la web en local.
 *
 *   node scripts/servidor.mjs        → http://localhost:4173
 *   node scripts/servidor.mjs 8080   → otro puerto
 *
 * Sirve los ficheros tal cual, sin recargas automáticas ni compilación:
 * exactamente lo mismo que verá el alojamiento definitivo.
 */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, extname, normalize } from 'node:path';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUERTO = Number(process.argv[2]) || 4173;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml':  'application/xml; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon'
};

const servidor = createServer(async (peticion, respuesta) => {
  const url = decodeURIComponent(peticion.url.split('?')[0]);

  // Se impide salir de la carpeta del proyecto.
  const seguro = normalize(url).replace(/^(\.\.[/\\])+/, '');
  let fichero = join(RAIZ, seguro);

  try {
    const info = await stat(fichero).catch(() => null);
    if (!info || info.isDirectory()) fichero = join(fichero, 'index.html');

    const contenido = await readFile(fichero);
    respuesta.writeHead(200, {
      'Content-Type': TIPOS[extname(fichero)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    respuesta.end(contenido);
  } catch {
    try {
      const noEncontrada = await readFile(join(RAIZ, '404.html'));
      respuesta.writeHead(404, { 'Content-Type': TIPOS['.html'] });
      respuesta.end(noEncontrada);
    } catch {
      respuesta.writeHead(404).end('404');
    }
  }
});

servidor.listen(PUERTO, () => {
  console.log(`\n  La Bodega de Sara → \x1b[1mhttp://localhost:${PUERTO}\x1b[0m`);
  console.log('  Ctrl+C para parar.\n');
});
