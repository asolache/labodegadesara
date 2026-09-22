/**
 * Datos estructurados (schema.org).
 *
 * Es la capa que leen Google, Bing y los modelos de lenguaje para entender
 * QUÉ es este negocio, QUÉ servicios ofrece y QUIÉN está detrás. Un buscador
 * puede deducirlo del texto; un asistente de IA que resume la web necesita
 * que esté declarado sin ambigüedad.
 *
 * Todo cuelga de dos entidades con identificador estable:
 *
 *   #negocio  → LocalBusiness  (La Bodega de Sara)
 *   #sara     → Person         (quien está detrás)
 *
 * Al referenciarlas siempre por su @id, las páginas describen un único grafo
 * coherente en lugar de repetir los mismos datos sin relacionarlos.
 */

/* Identificadores del grafo. Se construyen sobre el dominio para que sean
   únicos en todo internet. */
export const ID = {
  negocio: d => `${d}/#negocio`,
  sara:    d => `${d}/#sara`,
  web:     d => `${d}/#web`
};

/** Quita las claves vacías: un JSON-LD con nulos da avisos en Search Console. */
function limpiar(objeto) {
  if (Array.isArray(objeto)) return objeto.map(limpiar).filter(v => v != null);
  if (objeto === null || typeof objeto !== 'object') return objeto;

  const salida = {};
  for (const [clave, valor] of Object.entries(objeto)) {
    if (valor === undefined || valor === null || valor === '') continue;
    if (Array.isArray(valor) && valor.length === 0) continue;
    salida[clave] = limpiar(valor);
  }
  return salida;
}

/* ==========================================================================
   ENTIDADES PRINCIPALES
   ========================================================================== */

/**
 * El negocio. Se declara en todas las páginas para que cualquiera de ellas
 * sirva como punto de entrada al grafo.
 */
export function negocio(cfg) {
  const d = cfg.dominio;

  return limpiar({
    '@type': ['LocalBusiness', 'Organization'],
    '@id': ID.negocio(d),
    name: cfg.marca,
    alternateName: 'Bodega de Sara',
    url: `${d}/`,
    description: cfg.descripcionNegocio,
    slogan: cfg.lema,
    image: `${d}${cfg.imagenPrincipal}`,
    logo: { '@type': 'ImageObject', url: `${d}/assets/img/favicon.svg` },
    email: cfg.email,
    telephone: cfg.telefono || undefined,
    founder: { '@id': ID.sara(d) },
    priceRange: cfg.rangoPrecios,
    currenciesAccepted: 'EUR',
    knowsLanguage: ['es', 'ca'],

    address: {
      '@type': 'PostalAddress',
      addressLocality: cfg.ciudad,
      addressRegion: 'Barcelona',
      addressCountry: 'ES'
    },

    areaServed: cfg.zonas.map(nombre => ({ '@type': 'Place', name: nombre })),

    // Qué sabe hacer: lo que un asistente necesita para recomendarla.
    knowsAbout: cfg.temas,

    sameAs: cfg.redes,

    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Servicios de La Bodega de Sara',
      itemListElement: cfg.servicios.map(s => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: s.nombre,
          description: s.descripcion,
          url: `${d}${s.url}`
        }
      }))
    }
  });
}

/** Sara como persona: la entidad que sostiene la autoría y la confianza. */
export function persona(cfg) {
  const d = cfg.dominio;

  return limpiar({
    '@type': 'Person',
    '@id': ID.sara(d),
    name: cfg.persona.nombre,
    description: cfg.persona.descripcion,
    url: `${d}/sobre-mi/`,
    image: `${d}${cfg.persona.imagen}`,
    jobTitle: cfg.persona.puesto,
    knowsAbout: cfg.temas,
    worksFor: { '@id': ID.negocio(d) },
    sameAs: cfg.redes
  });
}

/** La web como tal, para que el buscador entienda el sitio como una unidad. */
export function sitioWeb(cfg) {
  const d = cfg.dominio;

  return limpiar({
    '@type': 'WebSite',
    '@id': ID.web(d),
    url: `${d}/`,
    name: cfg.marca,
    description: cfg.descripcionNegocio,
    inLanguage: 'es-ES',
    publisher: { '@id': ID.negocio(d) }
  });
}

/* ==========================================================================
   POR PÁGINA
   ========================================================================== */

/** La página concreta, enlazada al sitio y al negocio. */
export function pagina(cfg, p) {
  const d = cfg.dominio;
  const url = `${d}${p.url}`;

  return limpiar({
    '@type': p.tipoPagina ?? 'WebPage',
    '@id': `${url}#pagina`,
    url,
    name: p.titulo,
    description: p.descripcion,
    inLanguage: 'es-ES',
    isPartOf: { '@id': ID.web(d) },
    about: { '@id': ID.negocio(d) },
    primaryImageOfPage: p.imagen
      ? { '@type': 'ImageObject', url: `${d}${p.imagen}` }
      : undefined,
    breadcrumb: p.migas?.length
      ? { '@id': `${url}#migas` }
      : undefined
  });
}

/**
 * Migas de pan. Google las usa para mostrar la ruta en los resultados en
 * lugar de la URL desnuda, lo que mejora bastante el porcentaje de clics.
 */
export function migasDePan(cfg, p) {
  if (!p.migas?.length) return null;
  const d = cfg.dominio;

  const pasos = [
    { nombre: 'Inicio', url: '/' },
    ...p.migas
  ];

  return limpiar({
    '@type': 'BreadcrumbList',
    '@id': `${d}${p.url}#migas`,
    itemListElement: pasos.map((paso, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: paso.nombre,
      item: paso.url ? `${d}${paso.url}` : undefined
    }))
  });
}

/**
 * Preguntas frecuentes.
 *
 * Es el tipo de dato más rentable de todos: puede salir desplegado en Google
 * y es, literalmente, lo que un asistente de IA cita cuando alguien pregunta
 * «¿hace falta saber de vino para ir a una cata?».
 */
export function preguntasFrecuentes(cfg, p) {
  if (!p.faq?.length) return null;
  const d = cfg.dominio;

  return limpiar({
    '@type': 'FAQPage',
    '@id': `${d}${p.url}#faq`,
    inLanguage: 'es-ES',
    mainEntity: p.faq.map(({ pregunta, respuesta }) => ({
      '@type': 'Question',
      name: pregunta,
      acceptedAnswer: { '@type': 'Answer', text: respuesta }
    }))
  });
}

/** Un servicio concreto, con su público y su zona. */
export function servicio(cfg, p) {
  if (!p.servicio) return null;
  const d = cfg.dominio;
  const s = p.servicio;

  return limpiar({
    '@type': 'Service',
    '@id': `${d}${p.url}#servicio`,
    name: s.nombre,
    serviceType: s.tipo,
    description: s.descripcion,
    url: `${d}${p.url}`,
    provider: { '@id': ID.negocio(d) },
    areaServed: cfg.zonas.map(nombre => ({ '@type': 'Place', name: nombre })),
    audience: s.publico
      ? { '@type': 'Audience', audienceType: s.publico }
      : undefined,
    hasOfferCatalog: s.incluye?.length
      ? {
          '@type': 'OfferCatalog',
          name: s.nombre,
          itemListElement: s.incluye.map(item => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: item }
          }))
        }
      : undefined
  });
}

/* ==========================================================================
   MONTAJE
   ========================================================================== */

/**
 * Construye el grafo completo de una página.
 * Se emite como un único bloque @graph en lugar de varios <script> sueltos:
 * así las entidades quedan relacionadas entre sí y no repetidas.
 *
 * @param {Object} cfg    configuración global de SEO
 * @param {Object} p      definición de la página
 * @param {Object[]} [extra] entidades adicionales (eventos, artículo…)
 * @returns {string} JSON listo para insertar en un <script type="application/ld+json">
 */
export function grafo(cfg, p, extra = []) {
  const nodos = [
    sitioWeb(cfg),
    negocio(cfg),
    persona(cfg),
    pagina(cfg, p),
    migasDePan(cfg, p),
    preguntasFrecuentes(cfg, p),
    servicio(cfg, p),
    ...extra
  ].filter(Boolean);

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodos }, null, 2);
}
