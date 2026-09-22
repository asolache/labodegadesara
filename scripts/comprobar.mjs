#!/usr/bin/env node
/**
 * COMPROBADOR · La Bodega de Sara
 * ---------------------------------------------------------------------------
 *   node scripts/comprobar.mjs
 *
 * Revisa las páginas generadas antes de publicar. No sustituye al validador
 * del W3C, pero pilla lo que se rompe de verdad en el día a día:
 *
 *   · etiquetas mal cerradas o cruzadas
 *   · enlaces internos que apuntan a una página que no existe
 *   · imágenes sin texto alternativo o sin dimensiones
 *   · identificadores repetidos
 *   · campos de formulario sin etiqueta asociada
 *   · páginas sin título, sin descripción o sin un único h1
 *   · saltos en la jerarquía de encabezados
 *
 * Devuelve código de salida 1 si encuentra errores, para poder usarlo en una
 * comprobación automática.
 */

import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, posix } from 'node:path';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ruta = (...p) => join(RAIZ, ...p);

/* Elementos que no se cierran nunca. */
const VACIOS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img',
  'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

/* Elementos cuyo cierre es opcional en HTML: no se exige emparejarlos. */
const CIERRE_OPCIONAL = new Set(['li', 'p', 'td', 'th', 'tr', 'option',
  'thead', 'tbody', 'tfoot', 'dt', 'dd']);

const errores = [];
const avisos = [];

const error = (f, m) => errores.push(`${f}: ${m}`);
const aviso = (f, m) => avisos.push(`${f}: ${m}`);

/* ==========================================================================
   Analizador
   ========================================================================== */

/** Quita comentarios y el contenido de script/style, que no son marcado. */
function limpiar(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '<script></script>')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '<style></style>');
}

/** Comprueba que las etiquetas abren y cierran en el orden correcto. */
function revisarEtiquetas(fichero, html) {
  const pila = [];
  const patron = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/g;
  let m;

  while ((m = patron.exec(html)) !== null) {
    const [, cierre, bruto, atributos] = m;
    const etiqueta = bruto.toLowerCase();

    if (VACIOS.has(etiqueta) || atributos.trimEnd().endsWith('/')) continue;

    const linea = html.slice(0, m.index).split('\n').length;

    if (!cierre) {
      pila.push({ etiqueta, linea });
      continue;
    }

    if (CIERRE_OPCIONAL.has(etiqueta)) {
      // Se descarta hasta encontrarla, sin quejarse de los cierres implícitos.
      const i = pila.map(p => p.etiqueta).lastIndexOf(etiqueta);
      if (i !== -1) pila.splice(i);
      continue;
    }

    // Se permiten cierres implícitos de elementos con cierre opcional.
    while (pila.length && CIERRE_OPCIONAL.has(pila.at(-1).etiqueta) &&
           pila.at(-1).etiqueta !== etiqueta) {
      pila.pop();
    }

    const ultima = pila.pop();

    if (!ultima) {
      error(fichero, `línea ${linea}: </${etiqueta}> sin apertura`);
    } else if (ultima.etiqueta !== etiqueta) {
      error(fichero,
        `línea ${linea}: </${etiqueta}> cierra <${ultima.etiqueta}> ` +
        `abierta en la línea ${ultima.linea}`);
    }
  }

  for (const p of pila.filter(p => !CIERRE_OPCIONAL.has(p.etiqueta))) {
    error(fichero, `<${p.etiqueta}> de la línea ${p.linea} no se cierra`);
  }
}

/* ==========================================================================
   Revisiones de contenido
   ========================================================================== */

function revisarCabecera(fichero, html) {
  if (!/<html[^>]*\blang=/i.test(html)) error(fichero, 'falta lang en <html>');
  if (!/<meta[^>]*charset=/i.test(html)) error(fichero, 'falta el charset');
  if (!/<meta[^>]*name="viewport"/i.test(html)) error(fichero, 'falta el viewport');

  const titulo = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!titulo) error(fichero, 'falta el <title>');
  else if (titulo[1].trim().length > 65) {
    aviso(fichero, `el título tiene ${titulo[1].trim().length} caracteres (Google corta sobre 60)`);
  }

  const desc = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i);
  if (!desc) {
    if (!/name="robots"[^>]*noindex/i.test(html)) {
      error(fichero, 'falta la meta description');
    }
  } else if (desc[1].length > 165) {
    aviso(fichero, `la descripción tiene ${desc[1].length} caracteres (se corta sobre 160)`);
  }

  const h1 = html.match(/<h1\b/gi) ?? [];
  if (h1.length === 0) error(fichero, 'no hay ningún <h1>');
  if (h1.length > 1) error(fichero, `hay ${h1.length} <h1> (debe haber uno)`);
}

function revisarEncabezados(fichero, html) {
  const niveles = [...html.matchAll(/<h([1-6])\b/gi)].map(m => Number(m[1]));
  let anterior = 0;

  for (const nivel of niveles) {
    if (anterior && nivel > anterior + 1) {
      aviso(fichero, `salto de h${anterior} a h${nivel} en la jerarquía`);
    }
    anterior = nivel;
  }
}

function revisarImagenes(fichero, html) {
  for (const m of html.matchAll(/<img\b([^>]*)>/gi)) {
    const attrs = m[1];
    const src = (attrs.match(/src="([^"]*)"/) || [])[1] ?? '(sin src)';

    if (!/\balt=/.test(attrs)) {
      error(fichero, `<img> sin alt: ${src}`);
    }
    if (!/\bwidth=/.test(attrs) || !/\bheight=/.test(attrs)) {
      aviso(fichero, `<img> sin width/height (provoca saltos al cargar): ${src}`);
    }
  }
}

function revisarIdentificadores(fichero, html) {
  const vistos = new Map();

  for (const m of html.matchAll(/\bid="([^"]+)"/g)) {
    vistos.set(m[1], (vistos.get(m[1]) ?? 0) + 1);
  }

  for (const [id, veces] of vistos) {
    if (veces > 1) error(fichero, `el identificador "${id}" aparece ${veces} veces`);
  }
}

function revisarFormularios(fichero, html) {
  const etiquetas = new Set(
    [...html.matchAll(/<label[^>]*\bfor="([^"]+)"/g)].map(m => m[1]));

  for (const m of html.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)) {
    const attrs = m[2];
    if (/type="(hidden|submit|button)"/i.test(attrs)) continue;

    const id = (attrs.match(/\bid="([^"]+)"/) || [])[1];

    if (!id) {
      error(fichero, `<${m[1]}> sin id, no se le puede asociar una etiqueta`);
    } else if (!etiquetas.has(id) && !/aria-label=/.test(attrs)) {
      error(fichero, `<${m[1]} id="${id}"> no tiene <label for="${id}">`);
    }
  }
}

/** Los enlaces internos deben apuntar a algo que exista en el repositorio. */
function revisarEnlaces(fichero, html, paginas) {
  for (const m of html.matchAll(/\bhref="([^"]+)"/g)) {
    const destino = m[1];

    if (/^(https?:|mailto:|tel:|#|data:)/i.test(destino)) continue;

    // Se descartan el ancla y los parámetros: no forman parte del fichero.
    const [camino] = destino.split(/[?#]/);
    if (!camino) continue;

    // Las rutas absolutas se resuelven desde la raíz del proyecto.
    const relativa = camino.startsWith('/')
      ? camino.slice(1)
      : posix.join(posix.dirname(fichero), camino);

    const objetivo = relativa === '' || relativa.endsWith('/')
      ? posix.join(relativa, 'index.html')
      : relativa;

    if (!existsSync(ruta(objetivo)) && !paginas.has(objetivo)) {
      error(fichero, `enlace roto: ${destino}`);
    }
  }
}

/* ==========================================================================
   Principal
   ========================================================================== */

const paginas = [
  ...(await readdir(RAIZ)).filter(f => f.endsWith('.html')),
  ...(existsSync(ruta('blog'))
      ? (await readdir(ruta('blog'))).map(f => `blog/${f}`)
      : [])
];

const conjunto = new Set(paginas);

console.log(`\n\x1b[1mComprobando ${paginas.length} páginas…\x1b[0m\n`);

for (const pagina of paginas) {
  const html = await readFile(ruta(pagina), 'utf8');
  const limpio = limpiar(html);

  revisarEtiquetas(pagina, limpio);
  revisarCabecera(pagina, html);
  revisarEncabezados(pagina, limpio);
  revisarImagenes(pagina, limpio);
  revisarIdentificadores(pagina, limpio);
  revisarFormularios(pagina, limpio);
  revisarEnlaces(pagina, limpio, conjunto);
}

if (avisos.length) {
  console.log('\x1b[33mAvisos\x1b[0m');
  avisos.forEach(a => console.log(`  ! ${a}`));
  console.log('');
}

if (errores.length) {
  console.log('\x1b[31m\x1b[1mErrores\x1b[0m');
  errores.forEach(e => console.log(`  ✗ ${e}`));
  console.log(`\n\x1b[31m${errores.length} errores\x1b[0m y ${avisos.length} avisos.\n`);
  process.exit(1);
}

console.log(`\x1b[32m\x1b[1m✓ Sin errores.\x1b[0m ${avisos.length} avisos.\n`);
