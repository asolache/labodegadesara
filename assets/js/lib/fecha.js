/**
 * Fechas en castellano, tolerantes con lo que se escribe en una hoja de
 * cálculo. Sin dependencias: sirve en el navegador y en Node.
 */

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
                      'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
               'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles',
              'jueves', 'viernes', 'sábado'];

/**
 * Acepta 2026-10-15, 15/10/2026, 15-10-2026 y 15.10.2026, con hora opcional
 * ("15/10/2026 19:30") o pasada aparte. Siempre construye la fecha en horario
 * local para que no se desplace un día al cambiar de zona.
 *
 * @param {string} valor  Fecha tal cual viene de la hoja.
 * @param {string} [hora] Hora opcional en formato "19:30".
 * @returns {Date|null}   null si no se reconoce.
 */
export function aFecha(valor, hora = '') {
  if (!valor) return null;

  const texto = String(valor).trim();
  let anio, mes, dia;

  const iso = texto.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  const euro = texto.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);

  if (iso) {
    [, anio, mes, dia] = iso.map(Number);
  } else if (euro) {
    [, dia, mes, anio] = euro.map(Number);
    if (anio < 100) anio += 2000;
  } else {
    const suelta = new Date(texto);
    return Number.isNaN(suelta.getTime()) ? null : suelta;
  }

  // Hora: la del propio campo fecha o la que llegue por separado.
  const enFecha = texto.match(/(\d{1,2}):(\d{2})/);
  const aparte = String(hora).match(/(\d{1,2}):(\d{2})/);
  const reloj = aparte || enFecha;

  const h = reloj ? Number(reloj[1]) : 0;
  const m = reloj ? Number(reloj[2]) : 0;

  const fecha = new Date(anio, mes - 1, dia, h, m);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

/** 15 → "15" (día del mes, sin cero delante) */
export function dia(fecha) {
  return fecha ? String(fecha.getDate()) : '';
}

/** "oct" */
export function mesCorto(fecha) {
  return fecha ? MESES_CORTOS[fecha.getMonth()] : '';
}

/** "jueves 15 de octubre" */
export function fechaLarga(fecha) {
  if (!fecha) return '';
  return `${DIAS[fecha.getDay()]} ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;
}

/** "15 de octubre de 2026" */
export function fechaCompleta(fecha) {
  if (!fecha) return '';
  return `${fecha.getDate()} de ${MESES[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

/** "19:30", o cadena vacía si la cata no lleva hora. */
export function horaCorta(fecha) {
  if (!fecha) return '';
  if (fecha.getHours() === 0 && fecha.getMinutes() === 0) return '';
  const h = String(fecha.getHours()).padStart(2, '0');
  const m = String(fecha.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/** "2026-10-15" — el formato que necesita <time datetime="..."> */
export function aISO(fecha) {
  if (!fecha) return '';
  const p = n => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${p(fecha.getMonth() + 1)}-${p(fecha.getDate())}`;
}

/** Fecha y hora en ISO local, para los datos estructurados de eventos. */
export function aISOCompleta(fecha) {
  if (!fecha) return '';
  const p = n => String(n).padStart(2, '0');
  return `${aISO(fecha)}T${p(fecha.getHours())}:${p(fecha.getMinutes())}:00`;
}

/**
 * ¿Sigue siendo futura? Se da margen hasta el final del día para que una cata
 * de esta misma tarde no desaparezca de la web por la mañana.
 * @param {Date} fecha
 * @returns {boolean}
 */
export function esFutura(fecha) {
  if (!fecha) return false;
  const finDelDia = new Date(fecha);
  finDelDia.setHours(23, 59, 59, 999);
  return finDelDia.getTime() >= Date.now();
}
