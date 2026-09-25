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

    // Una dirección sin extensión apunta al index.html de esa carpeta.
    const candidatos = [objetivo];
    if (!objetivo.endsWith('.html')) {
      candidatos.push(`${objetivo}/index.html`, `${objetivo}.html`);
    }

    if (!candidatos.some(c => existsSync(ruta(c)) || paginas.has(c))) {
      error(fichero, `enlace roto: ${destino}`);
    }
  }
}

/* ==========================================================================
   SEO
   ========================================================================== */

/**
 * Revisa lo que decide si una página se posiciona o no:
 * canónica, datos estructurados válidos y metadatos únicos.
 */
function revisarSEO(fichero, html, vistos) {
  // En una página excluida del índice, la calidad de los metadatos da igual.
  const indexable = !/name="robots"[^>]*noindex/i.test(html);

  /* --- Dirección canónica --- */
  const canonical = (html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i) || [])[1];

  if (!canonical) {
    error(fichero, 'falta la dirección canónica');
  } else {
    if (!/^https:\/\//.test(canonical)) {
      error(fichero, `la canónica no es absoluta: ${canonical}`);
    }
    if (/\.html$/.test(canonical) && !canonical.endsWith('/404.html')) {
      aviso(fichero, `la canónica lleva extensión .html: ${canonical}`);
    }

    // La canónica tiene que corresponder con la ruta real del fichero.
    const esperada = fichero === 'index.html'
      ? '/'
      : `/${fichero.replace(/index\.html$/, '')}`;

    const ruta = canonical.replace(/^https?:\/\/[^/]+/, '');
    if (ruta !== esperada && fichero !== '404.html') {
      error(fichero, `la canónica (${ruta}) no coincide con la ruta real (${esperada})`);
    }
  }

  /* --- Títulos y descripciones repetidos ---
     Dos páginas con el mismo título compiten entre ellas en Google. */
  const titulo = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]?.trim();
  const desc = (html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i) || [])[1];

  if (titulo) {
    if (vistos.titulos.has(titulo)) {
      error(fichero, `título repetido, ya está en ${vistos.titulos.get(titulo)}`);
    } else {
      vistos.titulos.set(titulo, fichero);
    }
    if (indexable && titulo.length < 15) {
      aviso(fichero, `título muy corto (${titulo.length} caracteres)`);
    }
  }

  if (desc) {
    if (vistos.descripciones.has(desc)) {
      error(fichero, `descripción repetida, ya está en ${vistos.descripciones.get(desc)}`);
    } else {
      vistos.descripciones.set(desc, fichero);
    }
    if (indexable && desc.length < 70) {
      aviso(fichero, `descripción muy corta (${desc.length} caracteres)`);
    }
  }

  /* --- Compartir en redes --- */
  if (indexable && !/property="og:image"/.test(html)) aviso(fichero, 'sin og:image');
  if (indexable && !/property="og:title"/.test(html)) aviso(fichero, 'sin og:title');

  /* --- Datos estructurados --- */
  const bloques = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];

  if (!bloques.length) {
    error(fichero, 'sin datos estructurados');
    return;
  }

  for (const bloque of bloques) {
    let datos;
    try {
      datos = JSON.parse(bloque[1]);
    } catch (e) {
      error(fichero, `datos estructurados con JSON inválido: ${e.message}`);
      continue;
    }

    const nodos = datos['@graph'] ?? [datos];

    for (const nodo of nodos) {
      if (!nodo['@type']) {
        error(fichero, 'hay una entidad sin @type en los datos estructurados');
      }

      /* Un FAQPage cuyas preguntas no estén a la vista incumple las
         directrices de Google. Se comprueba que cada una aparezca. */
      if (nodo['@type'] === 'FAQPage') {
        for (const pregunta of nodo.mainEntity ?? []) {
          const enPagina = html.includes(
            pregunta.name.replace(/&/g, '&amp;').replace(/</g, '&lt;')
                         .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
                         .replace(/'/g, '&#39;'));
          if (!enPagina) {
            error(fichero,
              `la pregunta «${pregunta.name.slice(0, 45)}…» está en los datos ` +
              'estructurados pero no se ve en la página');
          }
        }
      }

      /* Un evento sin fecha o sin lugar no sale en los resultados. */
      if (nodo['@type'] === 'Event') {
        if (!nodo.startDate) error(fichero, `evento «${nodo.name}» sin fecha de inicio`);
        if (!nodo.location) error(fichero, `evento «${nodo.name}» sin lugar`);
      }
    }
  }
}

/* ==========================================================================
   Coherencia entre el listado y las páginas
   ========================================================================== */

/**
 * Cada artículo listado tiene que tener su página publicada.
 *
 * Esta comprobación existe porque llegó a pasar lo contrario: el listado del
 * blog mostraba artículos recién apuntados en la hoja de cálculo cuya página
 * todavía no había generado el sincronizador, y al pinchar salía un 404.
 */
async function revisarArticulos() {
  let posts;
  try {
    posts = JSON.parse(await readFile(ruta('data/blog.json'), 'utf8'));
  } catch {
    return;  // Sin artículos todavía: nada que comprobar.
  }

  for (const post of posts) {
    const pagina = `blog/${post.slug}/index.html`;
    if (!existsSync(ruta(pagina))) {
      error('data/blog.json',
        `el artículo «${post.titulo}» aparece en el listado pero no existe ` +
        `su página ${pagina}. Ejecuta node scripts/sync.mjs`);
    }
  }

  // Y al revés: una página huérfana es un artículo despublicado que se quedó.
  if (existsSync(ruta('blog'))) {
    const slugs = new Set(posts.map(p => p.slug));
    for (const entrada of await readdir(ruta('blog'), { withFileTypes: true })) {
      if (entrada.isDirectory() && !slugs.has(entrada.name)) {
        aviso('blog/', `la carpeta ${entrada.name}/ no corresponde a ningún ` +
                       'artículo del listado');
      }
    }
  }
}

/* ==========================================================================
   Configuración del alojamiento
   ========================================================================== */

/**
 * Revisa netlify.toml en busca de reglas capaces de dejar la web inaccesible.
 *
 * Existe por un incidente real: una redirección mandaba todo el sitio
 * (`https://<sitio>.netlify.app/*`) al dominio propio, que aún no estaba
 * conectado. Resultado: la web entera respondiendo hacia un dominio muerto
 * durante más de un día.
 *
 * La regla que se saca de ahí: una redirección puede acotarse a rutas
 * concretas, pero nunca capturar un host entero y mandarlo fuera del sitio.
 * Qué dominio es el bueno lo deciden el panel del alojamiento y las
 * direcciones canónicas, no una regla escrita a mano.
 */
async function revisarAlojamiento() {
  const fichero = 'netlify.toml';
  if (!existsSync(ruta(fichero))) return;

  const texto = await readFile(ruta(fichero), 'utf8');

  // Bloques [[redirects]] con sus campos, sin necesitar un analizador de TOML.
  for (const bloque of texto.split('[[redirects]]').slice(1)) {
    const valor = clave => (bloque.match(new RegExp(`${clave}\\s*=\\s*"([^"]*)"`)) || [])[1];

    const desde = valor('from');
    const hacia = valor('to');
    if (!desde || !hacia) continue;

    const forzada = /force\s*=\s*true/.test(bloque);
    const capturaHost = /^https?:\/\/[^/]+\/\*$/.test(desde.trim());
    const saleFuera = /^https?:\/\//.test(hacia.trim());

    if (forzada && capturaHost && saleFuera) {
      error(fichero,
        `la redirección «${desde}» captura un host entero y lo manda a ` +
        `«${hacia}» con force. Si el destino no responde, la web queda ` +
        'inaccesible. Acótala a rutas concretas o deja que lo resuelva el ' +
        'panel del alojamiento.');
    }
  }
}

/* ==========================================================================
   Principal
   ========================================================================== */

/** Todas las páginas publicables, estén donde estén. */
async function todasLasPaginas(dir = '') {
  const IGNORAR = new Set(['parciales', 'scripts', 'seo', 'docs', 'data',
                           'assets', 'node_modules', '.github']);
  const salida = [];

  for (const entrada of await readdir(ruta(dir), { withFileTypes: true })) {
    const relativa = dir ? `${dir}/${entrada.name}` : entrada.name;
    if (entrada.isDirectory()) {
      if (IGNORAR.has(entrada.name) || entrada.name.startsWith('.')) continue;
      salida.push(...await todasLasPaginas(relativa));
    } else if (entrada.name.endsWith('.html')) {
      salida.push(relativa);
    }
  }
  return salida;
}

const paginas = await todasLasPaginas();

const conjunto = new Set(paginas);

console.log(`\n\x1b[1mComprobando ${paginas.length} páginas…\x1b[0m\n`);

/* Para detectar títulos y descripciones repetidos entre páginas. */
const vistos = { titulos: new Map(), descripciones: new Map() };

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
  revisarSEO(pagina, html, vistos);
}

await revisarArticulos();
await revisarAlojamiento();

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
