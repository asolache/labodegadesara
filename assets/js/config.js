/**
 * LA BODEGA DE SARA · Configuración central
 * ---------------------------------------------------------------------------
 * Único fichero que hay que tocar para conectar la web con las hojas de
 * cálculo de Sara. Todo lo demás se alimenta de aquí.
 *
 * Cómo se obtiene una URL de hoja publicada:
 *   Google Sheets → Archivo → Compartir → Publicar en la web
 *   → elegir la pestaña concreta → formato "Valores separados por comas (.csv)"
 *   → Publicar → copiar el enlace y pegarlo abajo.
 *
 * Ver docs/MANUAL-SARA.md (para ella) y docs/OPERATIVA-CONTENIDOS.md (para ti).
 */

export const CONFIG = {
  /* --- Identidad ---------------------------------------------------------- */
  marca: 'La Bodega de Sara',
  // Dominio definitivo. De aquí salen las direcciones canónicas, el sitemap y
  // los datos estructurados, así que cambiarlo aquí lo cambia en toda la web.
  dominio: 'https://labodegadesara.com',

  /* --- Contacto -----------------------------------------------------------
     El correo se monta por partes y lo escribe el navegador, para no dejarlo
     en el HTML visible al alcance de los rastreadores de spam.

     Ojo: sí aparece en claro dentro de los datos estructurados, porque el
     dato de contacto es una señal importante en el posicionamiento local y
     tiene que coincidir con el de la ficha de Google Business. Es un
     intercambio consciente: algo más de spam a cambio de visibilidad. Si
     algún día molesta, se quita `email` de seo/paginas.js y se deja sólo en
     el formulario.                                                          */
  emailUsuario: 'sara',
  emailDominio: 'vinosdulces.com',
  telefono: '+34622680905', // formato internacional sin espacios, ej. '+34600000000'
  instagram: 'https://www.instagram.com/labodegade.sara/',
  ciudad: 'Barcelona',

  /* --- Fuentes de contenido en Google Sheets ------------------------------
     Pega aquí las URLs CSV publicadas. Mientras estén vacías, la web usa los
     ficheros de /data/*.json que genera el sincronizador.                  */
  hojas: {
    catas: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQPVDzNmtfSQ5TQX-v7raQkMGypVtY2kC9pLkd5aoiOyAx5f1ThOYz1SUC4fZ1UpXE5IxdVbmV6bMHm/pub?gid=1865165858&single=true&output=csv',   // pestaña "Catas"
    blog: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQPVDzNmtfSQ5TQX-v7raQkMGypVtY2kC9pLkd5aoiOyAx5f1ThOYz1SUC4fZ1UpXE5IxdVbmV6bMHm/pub?gid=1159033443&single=true&output=csv',    // pestaña "Blog"
    textos: ''   // pestaña "Textos" (opcional: frases editables de la home)
  },

  /* --- Datos ya sincronizados en el repositorio --------------------------- */
  datosLocales: {
    catas: '/data/catas.json',
    blog: '/data/blog.json'
  },

  /**
   * Refresco en vivo de las CATAS.
   *
   * true  → al abrir la web se consulta también el Google Sheet, de modo que
   *         Sara ve sus cambios en la agenda al instante, sin esperar a la
   *         sincronización.
   * false → sólo se usan los JSON del repositorio (algo más rápido).
   *
   * No afecta al blog: cada artículo necesita su página generada, así que el
   * listado se sirve siempre desde /data/blog.json para que no aparezcan
   * enlaces a artículos que todavía no están publicados.
   */
  refrescoEnVivo: true,

  /* --- Formulario de contacto --------------------------------------------
     Tres opciones, por orden de preferencia:
       'formspree' → pega el endpoint en formEndpoint
       'netlify'   → si alojas en Netlify, usa sus formularios nativos
       'mailto'    → sin servicios externos, abre el cliente de correo       */
  formulario: {
    modo: 'mailto',
    endpoint: '' // p. ej. 'https://formspree.io/f/xxxxxxx'
  },

  /* --- Reserva de plazas de cata ------------------------------------------
     Si Sara usa un Google Form general para reservar, ponlo aquí. Cada cata
     puede además llevar su propio enlace en la columna "reserva" de la hoja. */
  formularioReservaGeneral: '',

  /* --- Formato ------------------------------------------------------------ */
  idioma: 'es-ES',
  moneda: 'EUR'
};

/** Devuelve el email completo montado en tiempo de ejecución. */
export function email() {
  return `${CONFIG.emailUsuario}@${CONFIG.emailDominio}`;
}
