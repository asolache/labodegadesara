#!/usr/bin/env node
/**
 * Genera /data/*.json a partir de los CSV de ejemplo de docs/plantillas.
 *
 *   node scripts/semilla.mjs
 *
 * Sirve para dos cosas: tener contenido con el que ver la web antes de
 * conectar las hojas de Sara, y para probar en local sin tocar Google.
 * Una vez configuradas las hojas en assets/js/config.js, el que manda es
 * scripts/sync.mjs.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

import { csvAObjetos } from '../assets/js/lib/csv.js';
import { normalizarCata, normalizarPost, ordenarCatas, ordenarPosts }
  from '../assets/js/lib/contenido.js';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ruta = (...p) => join(RAIZ, ...p);

const catas = csvAObjetos(await readFile(ruta('docs/plantillas/catas.csv'), 'utf8'))
  .map(normalizarCata).filter(Boolean);

const posts = ordenarPosts(
  csvAObjetos(await readFile(ruta('docs/plantillas/blog.csv'), 'utf8'))
    .map(normalizarPost).filter(Boolean));

await mkdir(ruta('data'), { recursive: true });
await writeFile(ruta('data/catas.json'), `${JSON.stringify(catas, null, 2)}\n`);
await writeFile(ruta('data/blog.json'), `${JSON.stringify(posts, null, 2)}\n`);

const { futuras, pasadas } = ordenarCatas(catas);
console.log(`✓ data/catas.json — ${catas.length} catas (${futuras.length} por venir, ${pasadas.length} pasadas)`);
console.log(`✓ data/blog.json  — ${posts.length} artículos`);
