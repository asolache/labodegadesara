/**
 * Construye el bloque de cabecera SEO que se inyecta en cada página.
 *
 * Genera, a partir de la definición de `paginas.js`:
 *   · título y descripción
 *   · dirección canónica
 *   · instrucciones de indexación
 *   · Open Graph y Twitter Card, para cuando se comparte el enlace
 *   · el grafo completo de datos estructurados
 *
 * Las páginas HTML sólo llevan el marcador <!-- seo --> … <!-- /seo -->.
 */

import { grafo } from '../assets/js/lib/jsonld.js';
import { escapar } from '../assets/js/lib/markdown.js';

/**
 * @param {Object} cfg       configuración global (SEO de paginas.js)
 * @param {Object} p         definición de la página
 * @param {Object[]} [extra] entidades extra para el grafo (eventos, artículo…)
 * @returns {string} HTML para el <head>
 */
export function cabeceraSEO(cfg, p, extra = []) {
  const d = cfg.dominio;
  const url = `${d}${p.url}`;
  const imagen = p.imagen ? `${d}${p.imagen}` : `${d}${cfg.imagenPrincipal}`;

  const lineas = [];

  lineas.push(`<title>${escapar(p.titulo)}</title>`);
  lineas.push(`<meta name="description" content="${escapar(p.descripcion)}">`);
  lineas.push(`<link rel="canonical" href="${url}">`);

  /* Indexación. Las páginas legales y el error 404 no aportan nada en
     búsqueda, pero sus enlaces sí se siguen.
     max-image-preview:large permite que Google muestre la foto grande en los
     resultados, que es justo lo que interesa a una marca visual como esta. */
  lineas.push(p.indexar === false
    ? '<meta name="robots" content="noindex, follow">'
    : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">');

  lineas.push('');

  /* Al compartir el enlace por WhatsApp, Instagram o LinkedIn. */
  lineas.push(`<meta property="og:title" content="${escapar(p.titulo)}">`);
  lineas.push(`<meta property="og:description" content="${escapar(p.descripcion)}">`);
  lineas.push(`<meta property="og:url" content="${url}">`);
  lineas.push(`<meta property="og:image" content="${imagen}">`);
  if (p.imagenAlt) {
    lineas.push(`<meta property="og:image:alt" content="${escapar(p.imagenAlt)}">`);
  }
  lineas.push(`<meta property="og:type" content="${p.tipoOG ?? 'website'}">`);

  if (p.articulo) {
    lineas.push(`<meta property="article:published_time" content="${p.articulo.publicado}">`);
    if (p.articulo.modificado) {
      lineas.push(`<meta property="article:modified_time" content="${p.articulo.modificado}">`);
    }
    lineas.push(`<meta property="article:author" content="${escapar(p.articulo.autor)}">`);
    if (p.articulo.seccion) {
      lineas.push(`<meta property="article:section" content="${escapar(p.articulo.seccion)}">`);
    }
  }

  lineas.push(`<meta name="twitter:image" content="${imagen}">`);
  if (p.imagenAlt) {
    lineas.push(`<meta name="twitter:image:alt" content="${escapar(p.imagenAlt)}">`);
  }

  /* La imagen más grande de la pantalla inicial se precarga: es la métrica
     que Google mide como LCP y la que más pesa en la valoración de rapidez. */
  if (p.precargar) {
    lineas.push('');
    lineas.push(`<link rel="preload" as="image" href="${p.precargar}" fetchpriority="high">`);
  }

  lineas.push('');
  lineas.push('<script type="application/ld+json">');
  lineas.push(grafo(cfg, p, extra));
  lineas.push('</script>');

  return lineas.join('\n');
}
