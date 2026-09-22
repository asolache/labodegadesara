/**
 * Plantillas de marcado.
 *
 * Funciones puras que devuelven cadenas de HTML. Las usan tanto el navegador
 * (al refrescar en vivo) como el sincronizador de Node (al dejar el HTML ya
 * escrito en las páginas). Una sola definición del marcado para los dos
 * caminos: lo que ve el buscador y lo que ve quien navega son idénticos.
 */

import { escapar } from './markdown.js';
import { aFecha, dia, mesCorto, fechaLarga, fechaCompleta,
         horaCorta, aISO } from './fecha.js';

/* Iconos en línea: pesan menos que una petición y heredan el color. */
const ICONOS = {
  lugar: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>',
  reloj: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  plazas: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M18 20a6.4 6.4 0 0 0-2-4.6"/></svg>',
  publico: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 3v5a4 4 0 0 0 8 0V3Z"/><path d="M12 12v6M9 21h6"/></svg>'
};

const ETIQUETAS_ESTADO = {
  abierta:  { texto: 'Plazas libres', clase: '' },
  ultimas:  { texto: 'Últimas plazas', clase: 'etiqueta--vino' },
  agotado:  { texto: 'Completa', clase: 'etiqueta--agotado' }
};

/**
 * Tarjeta de una cata para el listado.
 * @param {Object} cata  objeto normalizado por contenido.js
 * @returns {string} HTML
 */
export function catalHTML(cata) {
  const fecha = cata.fecha ? new Date(cata.fecha) : aFecha(cata.fechaTexto, cata.hora);
  const hora = horaCorta(fecha) || cata.hora || '';
  const estado = ETIQUETAS_ESTADO[cata.estado] ?? ETIQUETAS_ESTADO.abierta;
  const agotada = cata.estado === 'agotado';

  const meta = [];
  if (cata.lugar) {
    const lugar = [cata.lugar, cata.ciudad].filter(Boolean).join(' · ');
    meta.push(`<li>${ICONOS.lugar}<span>${escapar(lugar)}</span></li>`);
  }
  if (hora) meta.push(`<li>${ICONOS.reloj}<span>${escapar(hora)} h</span></li>`);
  if (cata.plazas) meta.push(`<li>${ICONOS.plazas}<span>${escapar(cata.plazas)} plazas</span></li>`);
  if (cata.publico) meta.push(`<li>${ICONOS.publico}<span>${escapar(cata.publico)}</span></li>`);

  // Botón: reserva propia de la cata, o aviso de que está completa.
  const accion = agotada
    ? `<span class="etiqueta etiqueta--agotado">Completa</span>`
    : cata.reserva
      ? `<a class="boton boton--principal" href="${escapar(cata.reserva)}"
            target="_blank" rel="noopener noreferrer">Reservar plaza</a>`
      : `<a class="boton boton--linea" href="/contacto/">Quiero información</a>`;

  return `
<article class="cata" data-estado="${escapar(cata.estado)}">
  <div class="cata__fecha" aria-hidden="true">
    <span class="cata__dia">${escapar(dia(fecha))}</span>
    <span class="cata__mes">${escapar(mesCorto(fecha))}</span>
  </div>

  <div class="cata__cuerpo">
    <p class="vo">${escapar(fechaLarga(fecha))}</p>
    <h3 class="cata__titulo">${escapar(cata.titulo)}</h3>
    ${cata.descripcion ? `<p class="cata__texto">${escapar(cata.descripcion)}</p>` : ''}
    ${meta.length ? `<ul class="meta">${meta.join('')}</ul>` : ''}
  </div>

  <div class="cata__lateral">
    ${cata.precio ? `<p class="cata__precio">${escapar(formatearPrecio(cata.precio))}</p>` : ''}
    ${!agotada && cata.estado === 'ultimas'
      ? `<span class="etiqueta ${estado.clase}">${estado.texto}</span>` : ''}
    ${accion}
  </div>
</article>`.trim();
}

/** "35" → "35 €" ; "35 €" o "Gratuita" se dejan tal cual. */
export function formatearPrecio(precio) {
  const t = String(precio ?? '').trim();
  if (!t) return '';
  if (/^\d+([.,]\d+)?$/.test(t)) return `${t} €`;
  return t;
}

/**
 * Tarjeta de artículo para la portada del blog.
 *
 * @param {Object} post
 * @param {Object} [opciones]
 * @param {string} [opciones.base]  prefijo de ruta hacia los artículos
 * @param {number} [opciones.nivel] nivel del encabezado del título. En el
 *        listado del blog las tarjetas cuelgan directamente del h1, así que
 *        son h2; en la portada van bajo el h2 de la sección, así que son h3.
 */
export function postHTML(post, { base = '/blog/', nivel = 3 } = {}) {
  const fecha = post.fecha ? new Date(post.fecha) : aFecha(post.fechaTexto);
  const url = `${base}${post.slug}/`;
  const h = Math.min(6, Math.max(2, nivel));

  return `
<article class="tarjeta">
  ${post.imagen ? `
  <div class="tarjeta__media">
    <img src="${escapar(post.imagen)}" alt="${escapar(post.alt || '')}"
         loading="lazy" decoding="async" width="600" height="400">
  </div>` : ''}
  <div class="tarjeta__cuerpo">
    ${post.categoria ? `<span class="etiqueta">${escapar(post.categoria)}</span>` : ''}
    <h${h} class="tarjeta__titulo"><a href="${escapar(url)}">${escapar(post.titulo)}</a></h${h}>
    ${post.resumen ? `<p class="tarjeta__texto">${escapar(post.resumen)}</p>` : ''}
    <div class="tarjeta__pie">
      ${fecha ? `<time datetime="${aISO(fecha)}">${escapar(fechaCompleta(fecha))}</time>` : ''}
    </div>
  </div>
</article>`.trim();
}

/** Mensaje cuando todavía no hay nada que mostrar. */
export function vacioHTML(titulo, texto, accion = '') {
  return `
<div class="estado">
  <p><strong>${escapar(titulo)}</strong></p>
  <p>${escapar(texto)}</p>
  ${accion}
</div>`.trim();
}

/**
 * Datos estructurados de una cata, para que Google la entienda como evento
 * y pueda mostrarla en los resultados de búsqueda.
 * @returns {Object|null}
 */
export function eventoJSONLD(cata, dominio) {
  const fecha = cata.fecha ? new Date(cata.fecha) : aFecha(cata.fechaTexto, cata.hora);
  if (!fecha) return null;

  // Una cata dura unas dos horas: declarar el final ayuda a que se muestre
  // bien en los resultados y en los calendarios.
  const fin = new Date(fecha.getTime() + 2 * 60 * 60 * 1000);

  const datos = {
    '@type': 'Event',
    '@id': `${dominio}/catas/#${cata.id}`,
    name: cata.titulo,
    startDate: fecha.toISOString(),
    endDate: fin.toISOString(),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    inLanguage: 'es-ES',
    isAccessibleForFree: false,
    url: `${dominio}/catas/`,
    organizer: { '@id': `${dominio}/#negocio` },
    performer: { '@id': `${dominio}/#sara` },
    image: `${dominio}/assets/img/fotos/sara-cata-blanco.jpg`
  };

  if (cata.descripcion) datos.description = cata.descripcion;
  if (cata.plazas) datos.maximumAttendeeCapacity = Number(cata.plazas) || undefined;

  if (cata.publico) {
    datos.audience = { '@type': 'Audience', audienceType: cata.publico };
  }

  if (cata.lugar) {
    datos.location = {
      '@type': 'Place',
      name: cata.lugar,
      address: {
        '@type': 'PostalAddress',
        addressLocality: cata.ciudad || 'Barcelona',
        addressRegion: 'Barcelona',
        addressCountry: 'ES'
      }
    };
  } else {
    // Sin lugar concreto, al menos la ciudad: un evento sin location no es
    // válido para Google y se queda fuera de los resultados enriquecidos.
    datos.location = {
      '@type': 'Place',
      name: cata.ciudad || 'Barcelona',
      address: {
        '@type': 'PostalAddress',
        addressLocality: cata.ciudad || 'Barcelona',
        addressCountry: 'ES'
      }
    };
  }

  const importe = String(cata.precio ?? '').replace(/[^\d.,]/g, '').replace(',', '.');
  if (importe) {
    datos.offers = {
      '@type': 'Offer',
      price: importe,
      priceCurrency: 'EUR',
      availability: cata.estado === 'agotado'
        ? 'https://schema.org/SoldOut'
        : 'https://schema.org/InStock',
      url: cata.reserva || `${dominio}/catas/`,
      validFrom: new Date().toISOString().slice(0, 10)
    };
  }

  return datos;
}

/**
 * Preguntas frecuentes visibles.
 *
 * Se generan a partir de las mismas preguntas que se declaran en los datos
 * estructurados de seo/paginas.js. Declarar un FAQPage cuyo contenido no está
 * a la vista incumple las directrices de Google, así que la única forma de no
 * equivocarse nunca es que ambos salgan de la misma fuente.
 *
 * @param {{pregunta: string, respuesta: string}[]} faq
 * @param {boolean} [primeraAbierta] deja la primera desplegada
 * @returns {string} HTML
 */
export function faqHTML(faq, primeraAbierta = false) {
  if (!faq?.length) return '';

  return faq.map((item, i) => `
<details${primeraAbierta && i === 0 ? ' open' : ''}>
  <summary>${escapar(item.pregunta)}</summary>
  <p>${escapar(item.respuesta)}</p>
</details>`.trim()).join('\n');
}
