/**
 * Markdown mínimo → HTML.
 *
 * Cubre lo que produce un Google Doc exportado a markdown y lo que se puede
 * escribir a mano en una celda: títulos, párrafos, negrita, cursiva, enlaces,
 * imágenes, listas, citas y separadores. Nada más, a propósito: es el
 * vocabulario con el que se escribe un artículo, y así el HTML resultante
 * siempre es predecible.
 *
 * Todo el texto se escapa antes de aplicar formato, de modo que nada de lo
 * que se escriba en el documento puede inyectar etiquetas en la página.
 */

/** Escapa los caracteres con significado en HTML. */
export function escapar(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Sólo se aceptan enlaces http(s), mailto y rutas internas. */
function enlaceSeguro(url) {
  const u = String(url ?? '').trim();
  return /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(u) ? u : '#';
}

/** Formato dentro de una línea: negrita, cursiva, enlaces, imágenes, código. */
function formatoEnLinea(texto) {
  let t = escapar(texto);

  // Imagen ![alt](url) — antes que el enlace, porque comparten sintaxis.
  t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,
    (_, alt, url) =>
      `<img src="${enlaceSeguro(url)}" alt="${alt}" loading="lazy" decoding="async">`);

  // Enlace [texto](url)
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, url) => {
    const destino = enlaceSeguro(url);
    const externo = /^https?:\/\//i.test(destino);
    const extra = externo ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${destino}"${extra}>${txt}</a>`;
  });

  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  t = t.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  t = t.replace(/(^|[\s(])_([^_\n]+)_/g, '$1<em>$2</em>');

  return t;
}

/**
 * Convierte un texto en markdown a HTML.
 * @param {string} fuente
 * @returns {string} HTML listo para insertar dentro del artículo.
 */
export function aHTML(fuente) {
  if (!fuente) return '';

  // Normaliza saltos de línea y separa en bloques por línea en blanco.
  const texto = String(fuente).replace(/\r\n?/g, '\n').trim();
  const lineas = texto.split('\n');
  const salida = [];

  /* Los encabezados se recolocan para que el más alto del artículo sea un h2.
     El h1 lo pone la plantilla con el título del post, así que un documento
     que use "Título 1" y otro que use "Título 2" producen los dos una
     jerarquía correcta, sin saltos. */
  const usados = [...texto.matchAll(/^(#{1,6})\s+\S/gm)].map(m => m[1].length);
  const desplazamiento = usados.length ? 2 - Math.min(...usados) : 0;

  let i = 0;

  while (i < lineas.length) {
    const linea = lineas[i];
    const limpia = linea.trim();

    if (limpia === '') { i++; continue; }

    // Separador: --- o ***
    if (/^([-*_])\1{2,}$/.test(limpia)) {
      salida.push('<hr>');
      i++;
      continue;
    }

    // Título: # … ######
    const titulo = limpia.match(/^(#{1,6})\s+(.*)$/);
    if (titulo) {
      const nivel = Math.min(6, Math.max(2, titulo[1].length + desplazamiento));
      salida.push(`<h${nivel}>${formatoEnLinea(titulo[2])}</h${nivel}>`);
      i++;
      continue;
    }

    // Cita: una o más líneas que empiezan por >
    if (/^>\s?/.test(limpia)) {
      const bloque = [];
      while (i < lineas.length && /^>\s?/.test(lineas[i].trim())) {
        bloque.push(lineas[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      salida.push(`<blockquote><p>${formatoEnLinea(bloque.join(' '))}</p></blockquote>`);
      continue;
    }

    // Lista sin orden: -, * o •  (Google Docs usa el punto medio)
    if (/^[-*•]\s+/.test(limpia)) {
      const puntos = [];
      while (i < lineas.length && /^[-*•]\s+/.test(lineas[i].trim())) {
        puntos.push(lineas[i].trim().replace(/^[-*•]\s+/, ''));
        i++;
      }
      salida.push(`<ul>${puntos.map(p => `<li>${formatoEnLinea(p)}</li>`).join('')}</ul>`);
      continue;
    }

    // Lista numerada: 1. 2. 3.
    if (/^\d+[.)]\s+/.test(limpia)) {
      const puntos = [];
      while (i < lineas.length && /^\d+[.)]\s+/.test(lineas[i].trim())) {
        puntos.push(lineas[i].trim().replace(/^\d+[.)]\s+/, ''));
        i++;
      }
      salida.push(`<ol>${puntos.map(p => `<li>${formatoEnLinea(p)}</li>`).join('')}</ol>`);
      continue;
    }

    // Párrafo: líneas seguidas hasta la próxima en blanco o bloque nuevo.
    const parrafo = [];
    while (i < lineas.length) {
      const l = lineas[i].trim();
      if (l === '' ||
          /^(#{1,6})\s/.test(l) ||
          /^>\s?/.test(l) ||
          /^[-*•]\s+/.test(l) ||
          /^\d+[.)]\s+/.test(l) ||
          /^([-*_])\1{2,}$/.test(l)) break;
      parrafo.push(l);
      i++;
    }

    if (parrafo.length) {
      const html = formatoEnLinea(parrafo.join(' '));
      // Una imagen sola no debe ir envuelta en <p>.
      salida.push(/^<img [^>]+>$/.test(html) ? html : `<p>${html}</p>`);
    }
  }

  return salida.join('\n');
}

/**
 * Resumen en texto plano para la portada del blog y las metaetiquetas.
 * @param {string} fuente  markdown
 * @param {number} limite  caracteres máximos
 * @returns {string}
 */
export function resumir(fuente, limite = 165) {
  const plano = String(fuente ?? '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')     // imágenes
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')  // enlaces → su texto
    .replace(/[#>*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (plano.length <= limite) return plano;

  const corte = plano.slice(0, limite);
  const espacio = corte.lastIndexOf(' ');
  return `${corte.slice(0, espacio > 0 ? espacio : limite).trimEnd()}…`;
}
