#!/usr/bin/env node
/**
 * SINCRONIZADOR DE CONTENIDO · La Bodega de Sara
 * ---------------------------------------------------------------------------
 * Un solo comando convierte lo que Sara escribe en Google en la web publicada:
 *
 *   node scripts/sync.mjs
 *
 * Qué hace, por orden:
 *   1. Lee las pestañas publicadas del Google Sheet (catas y blog).
 *   2. Para los artículos que viven en un Google Doc, se descarga el documento.
 *   3. Guarda todo en /data/*.json.
 *   4. Genera una página HTML por artículo en /blog/.
 *   5. Escribe las catas y los artículos dentro de las páginas, para que el
 *      contenido esté en el HTML sin depender de JavaScript.
 *   6. Inyecta los parciales (cabecera, pie, head) en todas las páginas.
 *   7. Genera sitemap.xml y rss.xml.
 *
 * Es idempotente: ejecutarlo dos veces seguidas da el mismo resultado. Y no
 * necesita ninguna dependencia externa, sólo Node 18 o superior.
 */

import { readFile, writeFile, readdir, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

import { CONFIG } from '../assets/js/config.js';
import { csvAObjetos } from '../assets/js/lib/csv.js';
import { normalizarCata, normalizarPost, ordenarCatas, ordenarPosts }
  from '../assets/js/lib/contenido.js';
import { catalHTML, postHTML, vacioHTML, eventoJSONLD }
  from '../assets/js/lib/plantillas.js';
import { aHTML, resumir, escapar } from '../assets/js/lib/markdown.js';
import { aFecha, fechaCompleta, aISO } from '../assets/js/lib/fecha.js';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ruta = (...partes) => join(RAIZ, ...partes);

const DOMINIO = CONFIG.dominio.replace(/\/$/, '');

/* Avisos por consola, para saber qué ha pasado en cada ejecución. */
const log = {
  paso:  m => console.log(`\n\x1b[1m▸ ${m}\x1b[0m`),
  ok:    m => console.log(`  \x1b[32m✓\x1b[0m ${m}`),
  info:  m => console.log(`  \x1b[2m·\x1b[0m ${m}`),
  aviso: m => console.log(`  \x1b[33m!\x1b[0m ${m}`),
  error: m => console.log(`  \x1b[31m✗\x1b[0m ${m}`)
};

/* ==========================================================================
   DESCARGA
   ========================================================================== */

/** Descarga un texto, con reintentos por si la red falla un momento. */
async function descargar(url, intentos = 3) {
  for (let i = 1; i <= intentos; i++) {
    try {
      const respuesta = await fetch(url, {
        redirect: 'follow',
        headers: { 'User-Agent': 'labodegadesara-sync' }
      });
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
      return await respuesta.text();
    } catch (error) {
      if (i === intentos) throw error;
      await new Promise(r => setTimeout(r, i * 1500));
    }
  }
}

/** Extrae el identificador de un enlace de Google Docs. */
function idDeDocumento(enlace) {
  const m = String(enlace).match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  return m ? m[1] : null;
}

/**
 * Descarga un Google Doc ya convertido a markdown.
 * El documento tiene que estar compartido como "cualquier persona con el
 * enlace puede ver".
 */
async function descargarDocumento(enlace) {
  const id = idDeDocumento(enlace);
  if (!id) throw new Error('El enlace del documento no tiene un formato válido');

  const texto = await descargar(
    `https://docs.google.com/document/d/${id}/export?format=markdown`);

  // Si Google devuelve la página de inicio de sesión, es que no es público.
  if (/<!DOCTYPE html>/i.test(texto.slice(0, 200))) {
    throw new Error('El documento no es público (Compartir → cualquiera con el enlace)');
  }

  return texto;
}

/* ==========================================================================
   1 · CATAS
   ========================================================================== */

async function sincronizarCatas() {
  log.paso('Catas');

  if (!CONFIG.hojas.catas) {
    log.aviso('Sin hoja configurada: se conserva data/catas.json');
    return leerJSON('data/catas.json');
  }

  try {
    const csv = await descargar(CONFIG.hojas.catas);
    const catas = csvAObjetos(csv).map(normalizarCata).filter(Boolean);

    await escribirJSON('data/catas.json', catas);

    const { futuras, pasadas } = ordenarCatas(catas);
    log.ok(`${catas.length} catas (${futuras.length} por venir, ${pasadas.length} pasadas)`);
    return catas;
  } catch (error) {
    log.error(`No se ha podido leer la hoja de catas: ${error.message}`);
    log.aviso('Se conserva lo que ya había en data/catas.json');
    return leerJSON('data/catas.json');
  }
}

/* ==========================================================================
   2 · BLOG
   ========================================================================== */

async function sincronizarBlog() {
  log.paso('Blog');

  if (!CONFIG.hojas.blog) {
    log.aviso('Sin hoja configurada: se conserva data/blog.json');
    return leerJSON('data/blog.json');
  }

  let filas;
  try {
    filas = csvAObjetos(await descargar(CONFIG.hojas.blog));
  } catch (error) {
    log.error(`No se ha podido leer la hoja del blog: ${error.message}`);
    log.aviso('Se conserva lo que ya había en data/blog.json');
    return leerJSON('data/blog.json');
  }

  const anteriores = await leerJSON('data/blog.json');
  const posts = [];

  for (const fila of filas) {
    const post = normalizarPost(fila);
    if (!post) continue;

    // El cuerpo puede venir de un Google Doc.
    if (post.documento) {
      try {
        post.cuerpo = await descargarDocumento(post.documento);
        log.ok(`«${post.titulo}» — documento descargado`);
      } catch (error) {
        log.error(`«${post.titulo}»: ${error.message}`);

        // Si ya teníamos una versión buena, se mantiene antes que perderla.
        const previo = anteriores.find(p => p.slug === post.slug);
        if (previo?.cuerpo) {
          post.cuerpo = previo.cuerpo;
          log.aviso('  se conserva la versión anterior del artículo');
        } else {
          log.aviso('  se omite el artículo hasta que el documento sea accesible');
          continue;
        }
      }
    }

    if (!post.cuerpo) {
      log.aviso(`«${post.titulo}» no tiene contenido: se omite`);
      continue;
    }

    if (!post.resumen) post.resumen = resumir(post.cuerpo);
    posts.push(post);
  }

  const ordenados = ordenarPosts(posts);
  await escribirJSON('data/blog.json', ordenados);
  log.ok(`${ordenados.length} artículos publicados`);

  return ordenados;
}

/* ==========================================================================
   3 · PÁGINAS DE ARTÍCULO
   ========================================================================== */

async function generarArticulos(posts) {
  log.paso('Páginas de artículo');

  const plantilla = await leer('parciales/articulo.html');
  const carpeta = ruta('blog');

  // Se rehace la carpeta entera para que no queden artículos despublicados.
  if (existsSync(carpeta)) await rm(carpeta, { recursive: true, force: true });
  await mkdir(carpeta, { recursive: true });

  for (const post of posts) {
    const fecha = post.fecha ? new Date(post.fecha) : aFecha(post.fechaTexto);
    const url = `${DOMINIO}/blog/${post.slug}.html`;

    const imagenAbsoluta = post.imagen
      ? (post.imagen.startsWith('http') ? post.imagen : `${DOMINIO}${post.imagen}`)
      : `${DOMINIO}/assets/img/fotos/sara-escribiendo.jpg`;

    const portada = post.imagen ? `
      <figure class="foto-marco" style="max-width: var(--ancho-max); margin: 0 auto var(--e-8)">
        <img src="${escapar(post.imagen)}" alt="${escapar(post.alt || post.titulo)}"
             width="1200" height="800" loading="eager" decoding="async"
             style="width: 100%; aspect-ratio: 3/2; object-fit: cover">
      </figure>` : '';

    const jsonld = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.titulo,
      description: post.resumen,
      image: imagenAbsoluta,
      datePublished: fecha ? fecha.toISOString() : undefined,
      author: { '@type': 'Person', name: post.autor },
      publisher: { '@type': 'Organization', name: 'La Bodega de Sara' },
      mainEntityOfPage: url
    }, null, 2);

    // El sufijo de marca sólo cabe si el título del artículo es corto.
    const tituloPagina = post.titulo.length > 42
      ? post.titulo
      : `${post.titulo} · La Bodega de Sara`;

    const html = plantilla
      .replaceAll('{{tituloPagina}}', escapar(tituloPagina))
      .replaceAll('{{titulo}}', escapar(post.titulo))
      .replaceAll('{{resumen}}', escapar(post.resumen))
      .replaceAll('{{categoria}}', escapar(post.categoria))
      .replaceAll('{{autor}}', escapar(post.autor))
      .replaceAll('{{url}}', url)
      .replaceAll('{{imagenAbsoluta}}', escapar(imagenAbsoluta))
      .replaceAll('{{fechaISO}}', fecha ? fecha.toISOString() : '')
      .replaceAll('{{fechaTexto}}', escapar(fechaCompleta(fecha)))
      .replaceAll('{{portada}}', portada)
      .replaceAll('{{jsonld}}', jsonld)
      .replaceAll('{{cuerpo}}', aHTML(post.cuerpo));

    await escribir(`blog/${post.slug}.html`, html);
    log.info(`blog/${post.slug}.html`);
  }

  log.ok(`${posts.length} páginas generadas`);
}

/* ==========================================================================
   4 · CONTENIDO DENTRO DE LAS PÁGINAS
   ========================================================================== */

/**
 * Sustituye el contenido entre los marcadores de un contenedor por el HTML ya
 * construido. Así el contenido viaja en la página y lo ven tanto los
 * buscadores como quien navega sin JavaScript.
 *
 * En la página, un contenedor tiene esta pinta:
 *
 *   <div class="rejilla" data-blog data-limite="3">
 *     <!-- contenido:inicio -->
 *     …lo que escribe esta función…
 *     <!-- contenido:fin -->
 *   </div>
 *
 * Se trabaja con marcadores y no con las etiquetas <div>, porque el contenido
 * generado lleva sus propios <div> anidados y una expresión regular no sabe
 * emparejarlos. Con marcadores, además, la operación es repetible: ejecutar
 * la sincronización dos veces deja exactamente el mismo fichero.
 */
function inyectarEnContenedor(html, atributo, generar) {
  const patron = new RegExp(
    `(<div[^>]*\\b${atributo}\\b[^>]*>)` +      // apertura del contenedor
    `([\\s\\S]*?)` +                            // lo que haya delante
    `(<!-- contenido:inicio -->)` +
    `[\\s\\S]*?` +                              // contenido anterior
    `(<!-- contenido:fin -->)`, 'g');

  return html.replace(patron, (completo, apertura, previo, inicio, fin) => {
    const limite = Number((apertura.match(/data-limite="(\d+)"/) || [])[1]) || 0;
    const tipo = (apertura.match(/data-catas="([^"]+)"/) || [])[1] || '';
    const nivel = Number((apertura.match(/data-nivel="(\d+)"/) || [])[1]) || 3;

    const contenido = generar({ limite, tipo, nivel });
    if (contenido === null) return completo;

    return `${apertura}${previo}${inicio}\n${contenido}\n      ${fin}`;
  });
}

async function inyectarContenido(catas, posts) {
  log.paso('Contenido dentro de las páginas');

  const { futuras, pasadas } = ordenarCatas(catas);

  for (const pagina of ['index.html', 'catas.html', 'blog.html']) {
    let html = await leer(pagina);

    html = inyectarEnContenedor(html, 'data-catas', ({ limite, tipo }) => {
      let lista = tipo === 'pasadas' ? pasadas : futuras;
      if (limite > 0) lista = lista.slice(0, limite);

      if (!lista.length) {
        return tipo === 'pasadas'
          ? ''
          : vacioHTML(
              'Ahora mismo no hay catas con fecha',
              'Estoy preparando las próximas. Escríbeme y te aviso en cuanto abra plazas.',
              '<a class="boton boton--principal" href="/contacto.html">Avísame</a>');
      }

      return lista.map(catalHTML).join('\n');
    });

    html = inyectarEnContenedor(html, 'data-blog', ({ limite, nivel }) => {
      const lista = limite > 0 ? posts.slice(0, limite) : posts;

      if (!lista.length) {
        return vacioHTML(
          'Todavía no hay artículos publicados',
          'Pronto habrá historias de bodegas, botellas y mesas compartidas.');
      }

      return lista.map(p => postHTML(p, { nivel })).join('\n');
    });

    // Datos estructurados de eventos: sólo en la página de catas.
    if (pagina === 'catas.html') {
      const eventos = futuras.map(c => eventoJSONLD(c, DOMINIO)).filter(Boolean);
      const bloque = eventos.length
        ? `<script type="application/ld+json">\n${JSON.stringify(eventos, null, 2)}\n</script>`
        : '';

      html = html.replace(
        /<!-- eventos -->[\s\S]*?<!-- \/eventos -->/,
        `<!-- eventos -->\n${bloque}\n<!-- /eventos -->`);
    }

    await escribir(pagina, html);
    log.info(pagina);
  }

  log.ok('Catas y artículos escritos en el HTML');
}

/* ==========================================================================
   5 · PARCIALES
   ========================================================================== */

/**
 * Inyecta cabecera, pie y head en todas las páginas, entre los marcadores:
 *   <!-- #incluir cabecera -->  …  <!-- /#incluir -->
 */
async function inyectarParciales() {
  log.paso('Parciales');

  const parciales = {};
  for (const nombre of ['head', 'cabecera', 'pie']) {
    parciales[nombre] = (await leer(`parciales/${nombre}.html`)).trim();
  }

  const paginas = [
    ...(await readdir(RAIZ)).filter(f => f.endsWith('.html')),
    ...(existsSync(ruta('blog'))
        ? (await readdir(ruta('blog'))).map(f => `blog/${f}`)
        : [])
  ];

  let tocadas = 0;

  for (const pagina of paginas) {
    const original = await leer(pagina);
    let html = original;

    for (const [nombre, contenido] of Object.entries(parciales)) {
      const patron = new RegExp(
        `<!-- #incluir ${nombre} -->[\\s\\S]*?<!-- /#incluir -->`, 'g');

      // En las páginas de /blog/ los enlaces internos siguen siendo absolutos,
      // así que el parcial vale tal cual.
      html = html.replace(patron,
        `<!-- #incluir ${nombre} -->\n${contenido}\n<!-- /#incluir -->`);
    }

    if (html !== original) {
      await escribir(pagina, html);
      tocadas++;
    }
  }

  log.ok(`${tocadas} páginas actualizadas de ${paginas.length}`);
}

/* ==========================================================================
   6 · SITEMAP Y RSS
   ========================================================================== */

async function generarSitemap(posts) {
  log.paso('Sitemap y RSS');

  const fijas = ['', 'catas.html', 'restaurantes.html', 'bodegas.html',
                 'blog.html', 'sobre-mi.html', 'contacto.html'];

  const hoy = aISO(new Date());

  const urls = [
    ...fijas.map(p => ({
      loc: `${DOMINIO}/${p}`,
      lastmod: hoy,
      priority: p === '' ? '1.0' : '0.8'
    })),
    ...posts.map(p => ({
      loc: `${DOMINIO}/blog/${p.slug}.html`,
      lastmod: p.fecha ? aISO(new Date(p.fecha)) : hoy,
      priority: '0.6'
    }))
  ];

  await escribir('sitemap.xml',
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`);

  await escribir('robots.txt',
`User-agent: *
Allow: /

Sitemap: ${DOMINIO}/sitemap.xml
`);

  const items = posts.slice(0, 20).map(p => {
    const fecha = p.fecha ? new Date(p.fecha) : null;
    return `    <item>
      <title>${escaparXML(p.titulo)}</title>
      <link>${DOMINIO}/blog/${p.slug}.html</link>
      <guid isPermaLink="true">${DOMINIO}/blog/${p.slug}.html</guid>
      <description>${escaparXML(p.resumen)}</description>
      ${fecha ? `<pubDate>${fecha.toUTCString()}</pubDate>` : ''}
    </item>`;
  }).join('\n');

  await escribir('rss.xml',
`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>La Bodega de Sara · El cuaderno</title>
    <link>${DOMINIO}/blog.html</link>
    <description>Historias de bodegas, botellas y mesas compartidas.</description>
    <language>es-ES</language>
${items}
  </channel>
</rss>
`);

  log.ok(`sitemap.xml (${urls.length} direcciones), robots.txt y rss.xml`);
}

function escaparXML(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ==========================================================================
   AUXILIARES DE FICHERO
   ========================================================================== */

const leer = f => readFile(ruta(f), 'utf8');
const escribir = (f, c) => writeFile(ruta(f), c, 'utf8');

async function leerJSON(f) {
  try { return JSON.parse(await leer(f)); } catch { return []; }
}

async function escribirJSON(f, datos) {
  await mkdir(dirname(ruta(f)), { recursive: true });
  await escribir(f, `${JSON.stringify(datos, null, 2)}\n`);
}

/* ==========================================================================
   PRINCIPAL
   ========================================================================== */

async function principal() {
  console.log('\n\x1b[1m\x1b[33mLA BODEGA DE SARA · sincronización de contenido\x1b[0m');

  const catas = await sincronizarCatas();
  const posts = await sincronizarBlog();

  await generarArticulos(posts);
  await inyectarContenido(catas, posts);
  await inyectarParciales();
  await generarSitemap(posts);

  console.log('\n\x1b[32m\x1b[1m✓ Listo.\x1b[0m Revisa los cambios y publica.\n');
}

principal().catch(error => {
  log.error(error.stack ?? error.message);
  process.exit(1);
});
