/**
 * Capa de datos del navegador.
 *
 * Estrategia en dos tiempos:
 *   1. Se pintan los datos de /data/*.json, que el sincronizador deja en el
 *      repositorio. Son instantáneos y los ven los buscadores.
 *   2. Si CONFIG.refrescoEnVivo está activo y hay una hoja publicada, se
 *      consulta además el Google Sheet y se vuelve a pintar si hay cambios.
 *      Así Sara ve lo que acaba de escribir sin esperar a la sincronización.
 *
 * Si el paso 2 falla (sin conexión, hoja despublicada), no pasa nada: la web
 * sigue mostrando lo del paso 1.
 */

import { CONFIG } from './config.js';
import { csvAObjetos } from './lib/csv.js';
import { normalizarCata, normalizarPost, ordenarCatas, ordenarPosts } from './lib/contenido.js';

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
 * Ojo: en vivo sólo llegan los cuerpos escritos directamente en la hoja. Los
 * que viven en un Google Doc los resuelve el sincronizador, así que para esos
 * manda siempre la versión del repositorio.
 */
export async function cargarPosts(alActualizar) {
  const locales = await leerJSONLocal(CONFIG.datosLocales.blog);
  const entregado = JSON.stringify(locales);

  alActualizar(ordenarPosts(locales));

  if (!CONFIG.refrescoEnVivo || !CONFIG.hojas.blog) return;

  const filas = await leerHoja(CONFIG.hojas.blog);
  if (!filas) return;

  // Sólo se añaden artículos nuevos que no dependan de un Google Doc.
  const conocidos = new Set(locales.map(p => p.slug));
  const nuevos = filas
    .map(normalizarPost)
    .filter(p => p && !conocidos.has(p.slug) && !p.documento && p.cuerpo);

  if (nuevos.length) {
    const combinados = ordenarPosts([...locales, ...nuevos]);
    if (JSON.stringify(combinados) !== entregado) alActualizar(combinados);
  }
}

/** Un artículo concreto por su dirección. */
export async function cargarPost(slug) {
  const posts = await leerJSONLocal(CONFIG.datosLocales.blog);
  return posts.find(p => p.slug === slug) ?? null;
}
