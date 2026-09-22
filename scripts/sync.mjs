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
import { catalHTML, postHTML, vacioHTML, eventoJSONLD, faqHTML }
  from '../assets/js/lib/plantillas.js';
import { aHTML, resumir, escapar } from '../assets/js/lib/markdown.js';
import { aFecha, fechaCompleta, aISO } from '../assets/js/lib/fecha.js';
import { SEO, paraPagina } from '../seo/paginas.js';
import { cabeceraSEO } from '../seo/generar.js';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ruta = (...partes) => join(RAIZ, ...partes);

const DOMINIO = SEO.dominio.replace(/\/$/, '');

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

  // Cada artículo vive en su propia carpeta para que la dirección quede
  // limpia: /blog/como-pedir-vino/ en lugar de /blog/como-pedir-vino.html
  // Se borran sólo las carpetas de artículos, nunca blog/index.html.
  for (const entrada of await readdir(ruta('blog'), { withFileTypes: true })) {
    if (entrada.isDirectory()) {
      await rm(ruta('blog', entrada.name), { recursive: true, force: true });
    }
  }

  for (const post of posts) {
    const fecha = post.fecha ? new Date(post.fecha) : aFecha(post.fechaTexto);
    const rutaPost = `/blog/${post.slug}/`;

    const imagen = post.imagen || '/assets/img/fotos/sara-escribiendo.jpg';
    const imagenAbsoluta = imagen.startsWith('http') ? imagen : `${DOMINIO}${imagen}`;

    const portada = post.imagen ? `
      <figure class="foto-marco" style="max-width: var(--ancho-max); margin: 0 auto var(--e-8)">
        <img src="${escapar(post.imagen)}" alt="${escapar(post.alt || post.titulo)}"
             width="1200" height="800" loading="eager" fetchpriority="high" decoding="async"
             style="width: 100%; aspect-ratio: 3/2; object-fit: cover">
      </figure>` : '';

    const cuerpoHTML = aHTML(post.cuerpo);

    // El artículo se declara como BlogPosting dentro del mismo grafo que el
    // negocio y Sara, para que quede claro quién lo firma y con qué autoridad.
    const articulo = {
      '@type': 'BlogPosting',
      '@id': `${DOMINIO}${rutaPost}#articulo`,
      headline: post.titulo.slice(0, 110),
      name: post.titulo,
      description: post.resumen,
      image: imagenAbsoluta,
      datePublished: fecha ? fecha.toISOString() : undefined,
      dateModified: fecha ? fecha.toISOString() : undefined,
      articleSection: post.categoria,
      wordCount: contarPalabras(post.cuerpo),
      inLanguage: 'es-ES',
      author: { '@id': `${DOMINIO}/#sara` },
      publisher: { '@id': `${DOMINIO}/#negocio` },
      isPartOf: { '@id': `${DOMINIO}/blog/#pagina` },
      mainEntityOfPage: `${DOMINIO}${rutaPost}`
    };

    // El sufijo de marca sólo cabe si el título del artículo es corto.
    const tituloPagina = post.titulo.length > 42
      ? post.titulo
      : `${post.titulo} · La Bodega de Sara`;

    const definicion = {
      url: rutaPost,
      titulo: tituloPagina,
      descripcion: post.resumen,
      imagen,
      imagenAlt: post.alt || post.titulo,
      tipoPagina: 'WebPage',
      tipoOG: 'article',
      migas: [
        { nombre: 'Blog', url: '/blog/' },
        { nombre: post.titulo, url: rutaPost }
      ],
      articulo: {
        publicado: fecha ? fecha.toISOString() : '',
        autor: post.autor,
        seccion: post.categoria
      }
    };

    const html = plantilla
      .replace(/<!-- seo -->[\s\S]*?<!-- \/seo -->/,
               `<!-- seo -->\n${cabeceraSEO(SEO, definicion, [articulo])}\n<!-- /seo -->`)
      .replaceAll('{{titulo}}', escapar(post.titulo))
      .replaceAll('{{categoria}}', escapar(post.categoria))
      .replaceAll('{{autor}}', escapar(post.autor))
      .replaceAll('{{fechaISO}}', fecha ? aISO(fecha) : '')
      .replaceAll('{{fechaTexto}}', escapar(fechaCompleta(fecha)))
      .replaceAll('{{portada}}', portada)
      .replaceAll('{{cuerpo}}', cuerpoHTML);

    await mkdir(ruta('blog', post.slug), { recursive: true });
    await escribir(`blog/${post.slug}/index.html`, html);
    log.info(`blog/${post.slug}/`);
  }

  log.ok(`${posts.length} páginas generadas`);
}

/** Palabras del artículo, para el dato wordCount de schema.org. */
function contarPalabras(texto) {
  return String(texto ?? '').trim().split(/\s+/).filter(Boolean).length;
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

  for (const pagina of ['index.html', 'catas/index.html', 'blog/index.html']) {
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
              '<a class="boton boton--principal" href="/contacto/">Avísame</a>');
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

    await escribir(pagina, html);
    log.info(pagina);
  }

  log.ok('Catas y artículos escritos en el HTML');
}

/* ==========================================================================
   5 · CABECERAS SEO
   ========================================================================== */

/**
 * Escribe en cada página su título, su descripción, su dirección canónica y
 * su grafo de datos estructurados, a partir de seo/paginas.js.
 *
 * Todo el posicionamiento se decide en ese fichero; aquí sólo se reparte.
 */
async function inyectarSEO(catas, posts) {
  log.paso('Cabeceras SEO');

  const { futuras } = ordenarCatas(catas);
  let escritas = 0;

  for (const [fichero, definicion] of Object.entries(SEO.paginas)) {
    if (!existsSync(ruta(fichero))) {
      log.aviso(`${fichero} está declarada en seo/paginas.js pero no existe`);
      continue;
    }

    const extra = [];

    // Las catas con fecha se declaran como eventos: es lo que permite que
    // aparezcan en Google con su día, su precio y su disponibilidad.
    if (fichero === 'catas/index.html') {
      const eventos = futuras.map(c => eventoJSONLD(c, DOMINIO)).filter(Boolean);
      extra.push(...eventos);

      // Y además, como lista ordenada, para que se entienda que es una agenda.
      if (eventos.length) {
        extra.push({
          '@type': 'ItemList',
          '@id': `${DOMINIO}/catas/#agenda`,
          name: 'Próximas catas de vino en Barcelona',
          numberOfItems: eventos.length,
          itemListElement: eventos.map((e, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: { '@id': e['@id'] }
          }))
        });
      }
    }

    // El listado del blog declara los artículos que contiene.
    if (fichero === 'blog/index.html' && posts.length) {
      extra.push({
        '@type': 'ItemList',
        '@id': `${DOMINIO}/blog/#lista`,
        numberOfItems: posts.length,
        itemListElement: posts.map((post, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${DOMINIO}/blog/${post.slug}/`,
          name: post.titulo
        }))
      });
    }

    const original = await leer(fichero);

    let html = original.replace(
      /<!-- seo -->[\s\S]*?<!-- \/seo -->/,
      `<!-- seo -->\n${cabeceraSEO(SEO, definicion, extra)}\n<!-- /seo -->`);

    // Las preguntas frecuentes visibles salen de la misma definición que el
    // dato estructurado, para que no puedan decir cosas distintas.
    if (definicion.faq?.length) {
      html = inyectarEnContenedor(html, 'data-faq', () => faqHTML(definicion.faq));
    }

    if (html !== original) { await escribir(fichero, html); escritas++; }
  }

  log.ok(`${escritas} páginas con cabecera SEO`);
}

/* ==========================================================================
   5 · PARCIALES
   ========================================================================== */

/**
 * Inyecta cabecera, pie y head en todas las páginas, entre los marcadores:
 *   <!-- #incluir cabecera -->  …  <!-- /#incluir -->
 */
/**
 * Todas las páginas HTML del sitio, estén en la raíz o en una subcarpeta.
 * Se dejan fuera las carpetas de trabajo, que no se publican.
 */
async function todasLasPaginas(dir = '') {
  const IGNORAR = new Set(['parciales', 'scripts', 'seo', 'docs', 'data',
                           'assets', 'node_modules', '.git', '.github']);
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

async function inyectarParciales() {
  log.paso('Parciales');

  const parciales = {};
  for (const nombre of ['head', 'cabecera', 'pie']) {
    parciales[nombre] = (await leer(`parciales/${nombre}.html`)).trim();
  }

  const paginas = await todasLasPaginas();

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
  log.paso('Sitemap, robots y llms.txt');

  const hoy = aISO(new Date());

  /* --- Mapa del sitio -------------------------------------------------
     Sólo entran las páginas indexables. Meter aquí una página con noindex
     manda una señal contradictoria a Google.                           */
  const urls = Object.values(SEO.paginas)
    .filter(p => p.indexar !== false && p.url !== '/404.html')
    .map(p => ({
      loc: `${DOMINIO}${p.url}`,
      lastmod: hoy,
      changefreq: p.frecuencia ?? 'monthly',
      priority: p.prioridad ?? '0.5'
    }));

  for (const post of posts) {
    urls.push({
      loc: `${DOMINIO}/blog/${post.slug}/`,
      lastmod: post.fecha ? aISO(new Date(post.fecha)) : hoy,
      changefreq: 'yearly',
      priority: '0.6'
    });
  }

  await escribir('sitemap.xml',
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`);

  /* --- robots.txt ------------------------------------------------------
     Se permite el paso a los rastreadores de los asistentes de IA de forma
     explícita. Es una decisión de negocio: a una marca que vive de que la
     descubran le interesa que ChatGPT, Claude o Perplexity puedan citarla
     cuando alguien pregunte por catas de vino en Barcelona. Si algún día se
     prefiere lo contrario, se cambia Allow por Disallow.                 */
  await escribir('robots.txt',
`# robots.txt · ${SEO.marca}
# Buscadores y asistentes de IA son bienvenidos: esta web existe para que
# la encuentren. Ver /llms.txt para un resumen legible por máquinas.

User-agent: *
Allow: /

# Rastreadores de asistentes de IA (permitidos a propósito)
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /

# Nada que rastrear aquí: son ficheros de trabajo, no contenido.
User-agent: *
Disallow: /parciales/
Disallow: /scripts/
Disallow: /seo/
Disallow: /docs/

Sitemap: ${DOMINIO}/sitemap.xml
`);

  /* --- llms.txt --------------------------------------------------------
     Resumen del sitio en texto plano para modelos de lenguaje. Un asistente
     que lo lea entiende en veinte líneas qué es esto, qué servicios hay y a
     qué página ir, sin tener que interpretar el HTML entero.            */
  await escribir('llms.txt', generarLlmsTxt(posts));

  log.ok(`sitemap.xml (${urls.length} direcciones), robots.txt y llms.txt`);

  /* --- RSS -------------------------------------------------------------- */
  const items = posts.slice(0, 20).map(p => {
    const fecha = p.fecha ? new Date(p.fecha) : null;
    return `    <item>
      <title>${escaparXML(p.titulo)}</title>
      <link>${DOMINIO}/blog/${p.slug}/</link>
      <guid isPermaLink="true">${DOMINIO}/blog/${p.slug}/</guid>
      <description>${escaparXML(p.resumen)}</description>
      ${fecha ? `<pubDate>${fecha.toUTCString()}</pubDate>` : ''}
    </item>`;
  }).join('\n');

  await escribir('rss.xml',
`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escaparXML(SEO.marca)} · El cuaderno</title>
    <link>${DOMINIO}/blog/</link>
    <atom:link href="${DOMINIO}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>Historias de bodegas, botellas y mesas compartidas.</description>
    <language>es-ES</language>
${items}
  </channel>
</rss>
`);

  log.ok('rss.xml');
}

/**
 * Genera /llms.txt siguiendo la convención llmstxt.org: un resumen del sitio
 * en Markdown, pensado para que un modelo de lenguaje sepa de qué va esto sin
 * rastrear página por página.
 */
function generarLlmsTxt(posts) {
  const s = SEO;

  const servicios = s.servicios
    .map(x => `- [${x.nombre}](${s.dominio}${x.url}): ${x.descripcion}`)
    .join('\n');

  const articulos = posts.slice(0, 10)
    .map(p => `- [${p.titulo}](${s.dominio}/blog/${p.slug}/): ${p.resumen}`)
    .join('\n');

  return `# ${s.marca}

> ${s.descripcionNegocio}

${s.marca} es un proyecto con base en ${s.ciudad} dedicado a acercar el vino a
quienes sienten que no es para ellos. Su planteamiento es explícitamente
antielitista: las catas no requieren conocimientos previos y se explican sin
tecnicismos.

Atiende a tres públicos distintos:

1. **Particulares** que quieren disfrutar del vino sin sentirse examinados:
   catas abiertas en grupo pequeño y catas privadas a medida.
2. **Restaurantes** que necesitan una carta de vinos con identidad y un equipo
   de sala capaz de recomendarla.
3. **Bodegas pequeñas** que buscan quien las represente comercialmente en
   Barcelona y cuente su historia.

## Datos

- Nombre: ${s.marca}
- Responsable: ${s.persona.nombre} — ${s.persona.puesto}
- Zona: ${s.zonas.join(', ')}
- Contacto: ${s.email}
- Instagram: ${s.redes[0]}
- Idiomas: español, catalán

## Servicios

${servicios}

## Páginas principales

- [Inicio](${s.dominio}/): presentación y próximas catas
- [Catas](${s.dominio}/catas/): agenda actualizada, catas privadas y preguntas frecuentes
- [Restaurantes](${s.dominio}/restaurantes/): cartas de vino y formación de sala
- [Bodegas](${s.dominio}/bodegas/): representación comercial y catas en bodega
- [Blog](${s.dominio}/blog/): divulgación sobre vino en lenguaje llano
- [Sobre Sara](${s.dominio}/sobre-mi/): quién está detrás del proyecto
- [Contacto](${s.dominio}/contacto/): formulario y vías de contacto

## Artículos

${articulos || '- (todavía no hay artículos publicados)'}

## Notas para asistentes

- La agenda de catas cambia a menudo: la fuente fiable de fechas, precios y
  plazas es ${s.dominio}/catas/, y los datos están marcados como eventos de
  schema.org en esa misma página.
- Los precios orientativos de las catas abiertas están entre 30 y 40 € por
  persona. Las catas privadas se presupuestan a medida a partir de 6 personas.
- No se vende vino por internet: el proyecto es de experiencias y asesoría.
`;
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
  await inyectarSEO(catas, posts);
  await generarSitemap(posts);

  console.log('\n\x1b[32m\x1b[1m✓ Listo.\x1b[0m Revisa los cambios y publica.\n');
}

principal().catch(error => {
  log.error(error.stack ?? error.message);
  process.exit(1);
});
