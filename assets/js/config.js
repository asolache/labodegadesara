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
  dominio: 'https://labodegadesara.com', // cambiar al dominio definitivo

  /* --- Contacto ----------------------------------------------------------- */
  // El email se monta por partes para que los bots no lo rastreen en el HTML.
  emailUsuario: 'hola',
  emailDominio: 'labodegadesara.com',
  telefono: '', // formato internacional sin espacios, ej. '+34600000000'
  instagram: 'https://www.instagram.com/labodegade.sara/',
  ciudad: 'Barcelona',

  /* --- Fuentes de contenido en Google Sheets ------------------------------
     Pega aquí las URLs CSV publicadas. Mientras estén vacías, la web usa los
     ficheros de /data/*.json que genera el sincronizador.                  */
  hojas: {
    catas: '',   // pestaña "Catas"
    blog: '',    // pestaña "Blog"
    textos: ''   // pestaña "Textos" (opcional: frases editables de la home)
  },

  /* --- Datos ya sincronizados en el repositorio --------------------------- */
  datosLocales: {
    catas: '/data/catas.json',
    blog: '/data/blog.json'
  },

  /**
   * Refresco en vivo.
   * true  → al abrir la web se consulta también el Google Sheet, de modo que
   *         Sara ve sus cambios al instante sin esperar a la sincronización.
   * false → sólo se usan los JSON del repositorio (más rápido y estable).
   * Recomendado: true en catas (cambian a menudo), false si notas lentitud.
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
