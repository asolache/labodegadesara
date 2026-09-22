/**
 * Capa de datos del navegador.
 *
 * Todo se sirve desde /data/*.json, que el sincronizador deja escrito en el
 * repositorio: es instantáneo, lo ven los buscadores y funciona sin conexión
 * con Google.
 *
 * Encima de eso, LAS CATAS admiten un refresco en vivo contra la hoja de
 * cálculo (CONFIG.refrescoEnVivo), para que Sara vea al momento lo que acaba
 * de escribir. Si ese refresco falla, no pasa nada: se queda lo del fichero.
 *
 * EL BLOG NO SE REFRESCA EN VIVO, a propósito. Un artículo necesita su propia
 * página generada, y listarlo antes de que exista sólo produce enlaces rotos.
 * La explicación larga está sobre cargarPosts().
 */

import { CONFIG } from './config.js';
import { csvAObjetos } from './lib/csv.js';
import { normalizarCata, ordenarCatas, ordenarPosts } from './lib/contenido.js';

/* La raíz del sitio, calculada desde este módulo (assets/js/datos.js).
   Permite servir la web tanto en el dominio como en una subcarpeta. */
const RAIZ = new URL('../../', import.meta.url);

function resolver(ruta) {
  return new URL(String(ruta).replace(/^\//, ''), RAIZ).href;
}

/** Descarga un JSON del repositorio. Devuelve [] si no existe todavía. */
async function leerJSONLocal(ruta) {
  try {
    const respuesta = await fetch(resolver(ruta), { cache: 'no-cache' });
    if (!respuesta.ok) return [];
    const datos = await respuesta.json();
    return Array.isArray(datos) ? datos : (datos.items ?? []);
  } catch {
    return [];
  }
}

/** Descarga una pestaña publicada como CSV y la convierte en filas. */
async function leerHoja(url) {
  if (!url) return null;
  try {
    const respuesta = await fetch(url, { cache: 'no-store' });
    if (!respuesta.ok) return null;
    return csvAObjetos(await respuesta.text());
  } catch {
    return null;
  }
}

/**
 * Catas.
 * @param {(datos: Object) => void} alActualizar
 *        Se llama una vez con los datos del repositorio y, si el refresco en
 *        vivo trae novedades, una segunda vez con los datos frescos.
 */
export async function cargarCatas(alActualizar) {
  const locales = await leerJSONLocal(CONFIG.datosLocales.catas);
  let entregado = JSON.stringify(locales);

  alActualizar(ordenarCatas(locales));

  if (!CONFIG.refrescoEnVivo || !CONFIG.hojas.catas) return;

  const filas = await leerHoja(CONFIG.hojas.catas);
  if (!filas) return;

  const frescas = filas.map(normalizarCata).filter(Boolean);
  if (JSON.stringify(frescas) !== entregado) {
    alActualizar(ordenarCatas(frescas));
  }
}

/**
 * Artículos del blog.
 *
 * A diferencia de las catas, el blog NO se refresca contra la hoja de cálculo.
 *
 * El motivo: cada artículo necesita su propia página en /blog/<slug>/, y esas
 * páginas sólo existen después de que el sincronizador las genere. Si aquí se
 * añadieran los artículos que Sara acaba de apuntar en la hoja, el listado
 * mostraría enlaces a páginas que todavía no están publicadas, y quien
 * pinchara se encontraría un error 404.
 *
 * Por eso el listado se sirve siempre desde /data/blog.json, que el
 * sincronizador escribe en la misma pasada en que crea las páginas: lo que se
 * lista y lo que se puede abrir van siempre a la par.
 *
 * Un artículo nuevo aparece, como mucho, una hora después de apuntarlo. Si hay
 * prisa, se lanza la sincronización a mano desde la pestaña Actions de GitHub.
 */
export async function cargarPosts(alActualizar) {
  const posts = await leerJSONLocal(CONFIG.datosLocales.blog);
  alActualizar(ordenarPosts(posts));
}

/** Un artículo concreto por su dirección. */
export async function cargarPost(slug) {
  const posts = await leerJSONLocal(CONFIG.datosLocales.blog);
  return posts.find(p => p.slug === slug) ?? null;
}
