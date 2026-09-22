/**
 * Esquema de contenido: cómo una fila de la hoja de cálculo se convierte en
 * una cata o en un artículo.
 *
 * Este fichero es la única definición del esquema y lo usan los dos lados:
 * el sincronizador de Node y el navegador. Si mañana hay que añadir una
 * columna, se añade aquí y funciona en ambos sitios.
 */

import { esSi } from './csv.js';
import { aFecha, aISO, esFutura } from './fecha.js';
import { resumir } from './markdown.js';

/**
 * Convierte un texto en una dirección web legible.
 * "Cata de vinos naturales" → "cata-de-vinos-naturales"
 */
export function aSlug(texto) {
  return String(texto ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || 'sin-titulo';
}

/** Primer valor no vacío de una lista de posibles nombres de columna. */
function campo(fila, ...nombres) {
  for (const n of nombres) {
    const v = fila[n];
    if (v !== undefined && String(v).trim() !== '') return String(v).trim();
  }
  return '';
}

/* ==========================================================================
   CATAS
   ========================================================================== */

/**
 * Normaliza una fila de la pestaña "Catas".
 *
 * Columnas reconocidas (mayúsculas y acentos dan igual):
 *   fecha · hora · titulo · lugar · ciudad · precio · plazas · estado
 *   descripcion · publico · reserva · imagen · destacada · publicar
 *
 * @param {Object} fila
 * @returns {Object|null} null si la fila está vacía o sin publicar.
 */
export function normalizarCata(fila) {
  const titulo = campo(fila, 'titulo', 'title', 'nombre', 'cata');
  if (!titulo) return null;

  // "publicar" vacío se interpreta como sí: lo normal es que lo que Sara
  // escribe en la hoja vaya a la web. Sólo un "no" explícito la oculta.
  const publicarBruto = campo(fila, 'publicar', 'publicado', 'visible', 'activo');
  if (publicarBruto && !esSi(publicarBruto)) return null;

  const fechaTexto = campo(fila, 'fecha', 'dia', 'date');
  const hora = campo(fila, 'hora', 'time');
  const fecha = aFecha(fechaTexto, hora);

  const estadoBruto = campo(fila, 'estado', 'status').toLowerCase();
  let estado = 'abierta';
  if (/agotad|completo|lleno|sold/.test(estadoBruto)) estado = 'agotado';
  else if (/ultim|pocas|quedan/.test(estadoBruto)) estado = 'ultimas';
  else if (/cancelad/.test(estadoBruto)) estado = 'cancelada';

  if (estado === 'cancelada') return null;

  return {
    id: campo(fila, 'id') || aSlug(`${titulo}-${aISO(fecha) || ''}`),
    titulo,
    slug: aSlug(titulo),
    fecha: fecha ? fecha.toISOString() : '',
    fechaTexto,
    hora,
    lugar: campo(fila, 'lugar', 'sitio', 'espacio', 'ubicacion'),
    ciudad: campo(fila, 'ciudad', 'poblacion'),
    precio: campo(fila, 'precio', 'importe', 'coste'),
    plazas: campo(fila, 'plazas', 'aforo', 'capacidad'),
    descripcion: campo(fila, 'descripcion', 'texto', 'detalle', 'resumen'),
    publico: campo(fila, 'publico', 'dirigido_a', 'tipo'),
    reserva: campo(fila, 'reserva', 'enlace', 'link', 'url', 'inscripcion'),
    imagen: campo(fila, 'imagen', 'foto', 'img'),
    destacada: esSi(campo(fila, 'destacada', 'destacado')),
    estado
  };
}

/**
 * Ordena las catas: primero las que aún no han pasado, de la más próxima a la
 * más lejana; después las pasadas, de la más reciente hacia atrás.
 */
export function ordenarCatas(catas) {
  const t = c => (c.fecha ? new Date(c.fecha).getTime() : Number.MAX_SAFE_INTEGER);

  const futuras = catas.filter(c => esFutura(c.fecha ? new Date(c.fecha) : null));
  const pasadas = catas.filter(c => !esFutura(c.fecha ? new Date(c.fecha) : null));

  futuras.sort((a, b) => t(a) - t(b));
  pasadas.sort((a, b) => t(b) - t(a));

  return { futuras, pasadas, todas: [...futuras, ...pasadas] };
}

/* ==========================================================================
   BLOG
   ========================================================================== */

/**
 * Normaliza una fila de la pestaña "Blog".
 *
 * Columnas reconocidas:
 *   fecha · titulo · resumen · cuerpo · documento · imagen · alt
 *   categoria · autor · destacado · publicar
 *
 * El cuerpo puede venir escrito en la propia celda o, mejor, en un Google Doc
 * cuyo enlace se pega en la columna "documento": el sincronizador lo descarga
 * y lo guarda ya convertido.
 *
 * @param {Object} fila
 * @returns {Object|null}
 */
export function normalizarPost(fila) {
  const titulo = campo(fila, 'titulo', 'title', 'nombre');
  if (!titulo) return null;

  const publicarBruto = campo(fila, 'publicar', 'publicado', 'visible', 'activo');
  if (publicarBruto && !esSi(publicarBruto)) return null;

  const fechaTexto = campo(fila, 'fecha', 'date');
  const fecha = aFecha(fechaTexto);
  const cuerpo = campo(fila, 'cuerpo', 'texto', 'contenido', 'articulo');
  const resumen = campo(fila, 'resumen', 'extracto', 'entradilla', 'descripcion');

  return {
    slug: aSlug(campo(fila, 'slug', 'url') || titulo),
    titulo,
    fecha: fecha ? fecha.toISOString() : '',
    fechaTexto,
    resumen: resumen || resumir(cuerpo),
    cuerpo,
    documento: campo(fila, 'documento', 'doc', 'google_doc', 'doc_url'),
    imagen: campo(fila, 'imagen', 'foto', 'portada', 'img'),
    alt: campo(fila, 'alt', 'texto_alternativo', 'descripcion_imagen'),
    categoria: campo(fila, 'categoria', 'tema', 'seccion') || 'Historias',
    autor: campo(fila, 'autor') || 'Sara',
    destacado: esSi(campo(fila, 'destacado', 'destacada'))
  };
}

/** Del más reciente al más antiguo. */
export function ordenarPosts(posts) {
  return [...posts].sort((a, b) => {
    const ta = a.fecha ? new Date(a.fecha).getTime() : 0;
    const tb = b.fecha ? new Date(b.fecha).getTime() : 0;
    return tb - ta;
  });
}
