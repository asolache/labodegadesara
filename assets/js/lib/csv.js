/**
 * Lector de CSV sin dependencias.
 * Se usa tanto en el navegador como en el sincronizador de Node, así que no
 * toca el DOM ni el sistema de ficheros.
 *
 * Soporta lo que Google Sheets produce al publicar una pestaña como CSV:
 * campos entrecomillados, comas y saltos de línea dentro de un campo,
 * comillas escapadas ("") y finales de línea CRLF o LF.
 */

/**
 * Convierte un texto CSV en una matriz de filas.
 * @param {string} texto
 * @returns {string[][]}
 */
export function leerCSV(texto) {
  const filas = [];
  let fila = [];
  let campo = '';
  let entreComillas = false;

  // Fuera el BOM que Google añade a veces al principio del fichero.
  const t = texto.replace(/^﻿/, '');

  for (let i = 0; i < t.length; i++) {
    const c = t[i];

    if (entreComillas) {
      if (c === '"') {
        if (t[i + 1] === '"') { campo += '"'; i++; }  // comilla escapada
        else entreComillas = false;
      } else {
        campo += c;
      }
      continue;
    }

    if (c === '"') { entreComillas = true; continue; }

    if (c === ',') { fila.push(campo); campo = ''; continue; }

    if (c === '\r') continue;               // se ignora: el \n manda

    if (c === '\n') {
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = '';
      continue;
    }

    campo += c;
  }

  // Última fila, si el fichero no termina en salto de línea.
  if (campo !== '' || fila.length > 0) {
    fila.push(campo);
    filas.push(fila);
  }

  return filas;
}

/**
 * Convierte un CSV en una lista de objetos usando la primera fila como
 * cabeceras. Las cabeceras se normalizan (minúsculas, sin acentos, sin
 * espacios) para que Sara pueda escribirlas como quiera en la hoja:
 * "Fecha", "fecha", "FECHA" o "Fecha " son la misma columna.
 *
 * @param {string} texto
 * @returns {Object<string,string>[]}
 */
export function csvAObjetos(texto) {
  const filas = leerCSV(texto).filter(f => f.some(c => c.trim() !== ''));
  if (filas.length < 2) return [];

  const claves = filas[0].map(normalizarClave);

  return filas.slice(1).map(fila => {
    const objeto = {};
    claves.forEach((clave, i) => {
      if (clave) objeto[clave] = (fila[i] ?? '').trim();
    });
    return objeto;
  });
}

/**
 * "Fecha de inicio" → "fecha_de_inicio"; "Precio (€)" → "precio"
 * @param {string} clave
 * @returns {string}
 */
export function normalizarClave(clave) {
  return String(clave)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')  // quita acentos
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Interpreta como verdadero los distintos "sí" que una persona puede escribir
 * en una hoja de cálculo.
 * @param {string} valor
 * @returns {boolean}
 */
export function esSi(valor) {
  return /^(s[ií]|si|true|verdadero|x|1|ok|activo|publicado)$/i
    .test(String(valor ?? '').trim());
}
