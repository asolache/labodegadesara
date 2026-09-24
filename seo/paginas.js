/**
 * ESTRATEGIA DE POSICIONAMIENTO · La Bodega de Sara
 * ===========================================================================
 *
 * Este es el único fichero donde se toca el SEO. De aquí salen, para cada
 * página, el <title>, la descripción, la dirección canónica, las etiquetas
 * para redes y todos los datos estructurados. Las páginas HTML sólo llevan un
 * marcador; el sincronizador escribe el resto.
 *
 * Así se puede revisar toda la estrategia de un vistazo, sin ir abriendo diez
 * ficheros y sin que dos páginas acaben con la misma descripción.
 *
 * CRITERIOS QUE SE HAN SEGUIDO
 * ---------------------------------------------------------------------------
 * · Título ≤ 60 caracteres, con la palabra clave al principio, porque es lo
 *   que se lee primero en el resultado de búsqueda.
 * · Descripción de 140 a 158 caracteres, escrita para que den ganas de entrar,
 *   no para repetir palabras clave. Google la reescribe si no le convence.
 * · Una intención de búsqueda por página. Dos páginas que compiten por lo
 *   mismo se estorban entre ellas.
 * · Nada que no se pueda sostener: ni titulaciones sin confirmar, ni cifras
 *   inventadas, ni valoraciones que nadie ha dejado. Un dato estructurado
 *   falso es motivo de penalización, además de una mentira.
 *
 * PENDIENTE
 * ---------------------------------------------------------------------------
 * · `rangoPrecios`: ajustar si las catas se mueven de la horquilla actual.
 * · Cuando haya reseñas reales (Google Business), añadir aggregateRating.
 *   Nunca antes, y nunca inventadas.
 *
 * RESUELTO
 * ---------------------------------------------------------------------------
 * · La titulación estaba pendiente de confirmar y ya consta en /sobre-mi/:
 *   WSET 3, y experiencia como sumiller en Aleia (dos estrellas Michelin).
 *   Por eso `persona.puesto` usa ya la palabra «sumiller», que es la que la
 *   gente busca de verdad.
 */

import { CONFIG, email } from '../assets/js/config.js';

export const SEO = {

  /* ======================================================================
     IDENTIDAD DEL NEGOCIO
     Lo que un buscador o un asistente necesita para saber qué es esto.
     ====================================================================== */

  /* Los datos de contacto viven en assets/js/config.js, que es donde los
     busca quien monta la web. Aquí se leen de allí para que no puedan acabar
     diciendo cosas distintas en el pie de página y en los datos
     estructurados. */
  dominio: CONFIG.dominio.replace(/\/$/, ''),
  marca: CONFIG.marca,
  lema: 'Vino sin complicaciones',

  descripcionNegocio:
    'Catas de vino y experiencias en Barcelona para disfrutar del vino sin ' +
    'necesidad de saber de vino. También asesoría de cartas de vinos y ' +
    'formación de sala para restaurantes, y representación comercial de ' +
    'bodegas pequeñas.',

  email: email(),
  telefono: CONFIG.telefono,
  ciudad: CONFIG.ciudad,
  rangoPrecios: '€€',
  imagenPrincipal: '/assets/img/fotos/sara-copas.jpg',

  redes: [CONFIG.instagram].filter(Boolean),

  zonas: ['Barcelona', 'Sant Cugat del Vallès',
          'Área metropolitana de Barcelona', 'Cataluña'],

  /* Los temas sobre los que esta marca tiene algo que decir. Es lo que un
     asistente de IA usa para decidir si merece la pena citarla ante una
     pregunta concreta. */
  temas: [
    'Cata de vinos',
    'Maridaje',
    'Vinos naturales y ecológicos',
    'Pequeños productores de vino',
    'Cartas de vino para restaurantes',
    'Formación de sala en vino',
    'Denominación de Origen Penedès',
    'Vinos catalanes',
    'Divulgación sobre vino'
  ],

  /* Catálogo de servicios: aparece en el grafo del negocio y es lo que
     permite que un asistente responda «¿quién hace X en Barcelona?». */
  servicios: [
    {
      nombre: 'Catas de vino en Barcelona',
      descripcion: 'Catas abiertas en grupo pequeño, sin tecnicismos y para todos los niveles.',
      url: '/catas/'
    },
    {
      nombre: 'Catas privadas y para empresas',
      descripcion: 'Catas a medida a domicilio, en oficinas o en el espacio que elijas, desde 6 personas.',
      url: '/catas/#privadas'
    },
    {
      nombre: 'Asesoría de carta de vinos para restaurantes',
      descripcion: 'Diseño de cartas de vino con identidad, ajustadas a la cocina, al público y al margen del restaurante.',
      url: '/restaurantes/'
    },
    {
      nombre: 'Formación de sala en vino',
      descripcion: 'Formación práctica para equipos de sala: cómo describir y recomendar vino para aumentar el ticket medio.',
      url: '/restaurantes/'
    },
    {
      nombre: 'Representación comercial de bodegas',
      descripcion: 'Representación en Barcelona de bodegas pequeñas: apertura de cuentas en restaurantes y vinotecas.',
      url: '/bodegas/'
    },
    {
      nombre: 'Catas en bodega',
      descripcion: 'Organización y conducción de catas en la propia bodega, con grupos llevados desde Barcelona.',
      url: '/bodegas/'
    }
  ],

  /* Todo lo de aquí lo cuenta ella misma en /sobre-mi/. Es lo que Google
     entiende como experiencia y autoridad, y lo que un asistente cita al
     explicar por qué merece la pena hacerle caso a alguien sobre vino. */
  persona: {
    nombre: 'Sara',
    puesto: 'Sumiller y asesora de vinos',
    descripcion:
      'Sumiller con once años de experiencia en hostelería. Ha trabajado en ' +
      'el restaurante Aleia (dos estrellas Michelin, Barcelona) y como ' +
      'comercial en Matos Wines. En 2023 abrió La Teresita Vinos y Platitos ' +
      'en Sant Cugat del Vallès. Acerca el vino a quienes sienten que no es ' +
      'para ellos, con catas sin tecnicismos, asesoría de cartas para ' +
      'restaurantes y la representación de pequeños productores.',
    imagen: '/assets/img/fotos/sara-cata-blanco.jpg',

    // Titulación acreditada: es la diferencia entre decir "sabe de vino" y
    // poder demostrarlo ante un buscador.
    titulacion: {
      nombre: 'WSET Level 3 Award in Wines',
      entidad: 'Wine & Spirit Education Trust'
    },

    // Dónde ha trabajado. Aleia y La Teresita son entidades reconocibles, y
    // asociarse a ellas traslada parte de su credibilidad.
    trayectoria: [
      { nombre: 'La Teresita Vinos y Platitos', lugar: 'Sant Cugat del Vallès' },
      { nombre: 'Aleia', lugar: 'Barcelona' },
      { nombre: 'Matos Wines' }
    ]
  },

  /* ======================================================================
     PÁGINAS
     Una entrada por página. `url` es la dirección definitiva, con barra
     final, sin extensión.
     ====================================================================== */

  paginas: {

    /* ---------------------------------------------------------------- HOME
       Intención: marca + descubrimiento general («catas de vino Barcelona»).
       Es la página que más peso tiene, así que apunta a la búsqueda más
       amplia del negocio.                                                  */
    'index.html': {
      url: '/',
      titulo: 'Catas de vino en Barcelona · La Bodega de Sara',
      descripcion:
        'Catas de vino en Barcelona para disfrutar sin saber de vino. Grupos ' +
        'pequeños y sin tecnicismos. También cartas de vino para restaurantes.',
      clavePrincipal: 'catas de vino Barcelona',
      imagen: '/assets/img/fotos/sara-copas.jpg',
      imagenAlt: 'Sara catando un vino blanco con tres copas más en la mano',
      tipoPagina: 'WebPage',
      prioridad: '1.0',
      frecuencia: 'weekly',
      // La imagen del hero es el elemento más grande de la página: se
      // precarga para que el navegador la pida cuanto antes.
      precargar: '/assets/img/fotos/sara-copas.jpg'
    },

    /* --------------------------------------------------------------- CATAS
       Intención: transaccional. Quien busca esto quiere apuntarse a algo.   */
    'catas/index.html': {
      url: '/catas/',
      titulo: 'Catas de vino en Barcelona · Agenda y catas privadas',
      descripcion:
        'Agenda de catas de vino en Barcelona y catas privadas a medida desde ' +
        '6 personas. Grupos pequeños, para todos los niveles y sin tecnicismos.',
      clavePrincipal: 'catas de vino en Barcelona',
      clavesSecundarias: [
        'cata privada Barcelona',
        'cata de vinos para empresas',
        'cata a ciegas Barcelona',
        'catas para grupos'
      ],
      imagen: '/assets/img/fotos/sara-cata-blanco.jpg',
      imagenAlt: 'Sara oliendo una copa de vino blanco a contraluz',
      tipoPagina: 'CollectionPage',
      prioridad: '0.9',
      frecuencia: 'daily',
      migas: [{ nombre: 'Catas', url: '/catas/' }],

      /* Estas preguntas están publicadas tal cual en la página. Declararlas
         aquí sin que se vean sería contenido engañoso, y Google lo penaliza. */
      faq: [
        {
          pregunta: '¿Necesito saber de vino para participar en una cata?',
          respuesta:
            'No. Las catas están pensadas precisamente para acercarse al vino ' +
            'desde la curiosidad, sin necesidad de conocimientos previos.'
        },
        {
          pregunta: '¿Cuánto dura una cata de vino?',
          respuesta:
            'Las catas suelen durar entre 1,5 y 2 horas ¡aunque al final siempre ' +
            'se alargan!'
        },
        {
          pregunta: '¿Cuántos vinos se prueban en una cata?',
          respuesta:
            'Dependiendo de la cata pero se suelen probar entre 4 y 5 vinos.'
        },
        {
          pregunta: '¿Dónde se realizan las catas de vino?',
          respuesta:
            'Las catas programadas se realizan en los espacios indicados en cada ' +
            'actividad. También organizo catas privadas en Barcelona y Catalunya.'
        },
        {
          pregunta: '¿Cuánto cuesta una cata de vino?',
          respuesta:
            'Las catas abiertas en Barcelona están normalmente entre 30 y 40 ' +
            'euros por persona, según los vinos y el acompañamiento. Las catas ' +
            'privadas se presupuestan según el grupo y el lugar.'
        },
        {
          pregunta: '¿Las catas incluyen algo de comer?',
          respuesta:
            'Siempre hay algo que acompaña: quesos, conservas, embutido o lo que ' +
            'pida el vino de ese día. No es una cena, pero nadie se queda con ' +
            'hambre. Las alergias e intolerancias se avisan al reservar.'
        },
        {
          pregunta: '¿Se puede cancelar una reserva en una cata?',
          respuesta:
            'Sí. Si me avisas con 48 horas de antelación te devuelvo el importe o ' +
            'hacemos un cambio de fecha. Con menos margen ya lo tengo todo ' +
            'preparado y se perderá la reserva.'
        },
        {
          pregunta: '¿Haces cata de vino para empresas?',
          respuesta:
            'Sí. Las catas para empresas y equipos se adaptan al número de ' +
            'personas, al espacio y al presupuesto, y se pueden hacer en la ' +
            'propia oficina o en un espacio alquilado.'
        }
      ],

      servicio: {
        nombre: 'Catas de vino en Barcelona',
        tipo: 'Cata de vinos',
        descripcion:
          'Catas de vino en grupo pequeño en Barcelona, abiertas al público o ' +
          'privadas a medida, pensadas para disfrutar sin conocimientos previos.',
        publico: 'Personas con curiosidad por el vino, sin conocimientos previos; empresas y grupos',
        incluye: [
          'Catas abiertas en Barcelona',
          'Catas privadas a domicilio',
          'Catas para empresas y equipos',
          'Catas temáticas y a ciegas'
        ]
      }
    },

    /* ------------------------------------------------------- RESTAURANTES
       Intención: comercial B2B. Quien busca esto tiene un negocio.          */
    'restaurantes/index.html': {
      url: '/restaurantes/',
      titulo: 'Carta de vinos y formación de sala para restaurantes',
      descripcion:
        'Diseño de cartas de vino con identidad y formación del equipo de sala ' +
        'en Barcelona. Más margen por botella y mejor experiencia en la mesa.',
      clavePrincipal: 'asesoría carta de vinos restaurante',
      clavesSecundarias: [
        'crear carta de vinos',
        'formación en vinos para camareros',
        'asesor de vinos para restaurantes Barcelona',
        'aumentar ticket medio restaurante'
      ],
      imagen: '/assets/img/fotos/carta-la-teresita.jpg',
      imagenAlt: 'Cartas de vino impresas sobre una mesa junto a libros de vino y notas de trabajo',
      tipoPagina: 'WebPage',
      prioridad: '0.9',
      frecuencia: 'monthly',
      migas: [{ nombre: 'Restaurantes', url: '/restaurantes/' }],

      faq: [
        {
          pregunta: '¿Qué tipo de restaurantes pueden trabajar con La Bodega de Sara?',
          respuesta:
            'Trabajo con restaurantes que quieren revisar, crear o actualizar su ' +
            'carta de vinos y mejorar la forma en que el equipo la presenta en ' +
            'sala. No importa tanto el tamaño como tener una propuesta ' +
            'gastronómica con personalidad y ganas de trabajar el vino de forma ' +
            'coherente.'
        },
        {
          pregunta: '¿Trabajas solo en Barcelona?',
          respuesta:
            'Trabajo principalmente en Sant Cugat del Vallès, Barcelona y otros ' +
            'puntos de Catalunya. Para proyectos concretos, podemos valorar ' +
            'desplazamientos a otras zonas.'
        },
        {
          pregunta: 'Ya tengo carta de vinos. ¿Puedes revisarla?',
          respuesta:
            'Sí. Podemos analizar qué funciona, qué no rota, qué referencias ' +
            'faltan y qué oportunidades hay para hacerla más coherente y ' +
            'personal.'
        },
        {
          pregunta: '¿Cuánto tarda en hacerse una carta de vinos?',
          respuesta:
            'Depende del tamaño de la carta, el número de referencias y el ' +
            'proceso de selección y cata. Como orientación, un proyecto completo ' +
            'suele desarrollarse en unas cuatro a seis semanas.'
        },
        {
          pregunta: '¿Tengo que cambiar toda mi carta?',
          respuesta:
            'No necesariamente. El objetivo no es cambiar por cambiar, sino ' +
            'entender qué tienes, qué funciona y qué puede mejorar. En algunos ' +
            'restaurantes tendrá sentido rehacerla; en otros, hacer una revisión ' +
            'y actualización.'
        }
      ],

      servicio: {
        nombre: 'Asesoría de carta de vinos y formación de sala',
        tipo: 'Asesoría gastronómica',
        descripcion:
          'Diseño de cartas de vino ajustadas a la cocina, el público y el ' +
          'margen del restaurante, con formación práctica del equipo de sala ' +
          'para saber recomendarlas.',
        publico: 'Restaurantes, bares de vinos y espacios gastronómicos',
        incluye: [
          'Diseño de carta de vinos',
          'Selección de referencias y proveedores',
          'Escandallo y política de precios',
          'Formación del equipo de sala',
          'Revisión de la carta por temporadas'
        ]
      }
    },

    /* ------------------------------------------------------------ BODEGAS
       Intención: comercial B2B. Nicho pequeño pero de altísimo valor.       */
    'bodegas/index.html': {
      url: '/bodegas/',
      titulo: 'Representación comercial de bodegas en Barcelona',
      descripcion:
        'Represento en Barcelona a bodegas pequeñas: apertura de cuentas en ' +
        'restaurantes y vinotecas, catas en bodega y relato de marca.',
      clavePrincipal: 'representación comercial bodegas Barcelona',
      clavesSecundarias: [
        'agente comercial de vinos',
        'distribución de vino en Barcelona',
        'catas en bodega',
        'vender vino a restaurantes'
      ],
      imagen: '/assets/img/fotos/sara-corcho.jpg',
      imagenAlt: 'Sara oliendo el corcho de una botella recién descorchada',
      tipoPagina: 'WebPage',
      prioridad: '0.8',
      frecuencia: 'monthly',
      migas: [{ nombre: 'Bodegas', url: '/bodegas/' }],

      faq: [
        {
          pregunta: '¿En qué se diferencia de una distribuidora de vinos?',
          respuesta:
            'Una distribuidora mueve volumen. Aquí el trabajo es de ' +
            'representación: presentar los vinos uno a uno a restaurantes y ' +
            'vinotecas escogidos, hacer las catas de venta y contar la historia ' +
            'de la bodega. Se trabaja con muy pocos productores a la vez.'
        },
        {
          pregunta: '¿Qué tipo de bodegas encajan?',
          respuesta:
            'Bodegas pequeñas o familiares, con producción limitada, trabajo ' +
            'respetuoso en la viña y alguien detrás con una historia real que ' +
            'contar. Si se busca volumen rápido y presencia en lineal de ' +
            'supermercado, no es el encaje adecuado.'
        },
        {
          pregunta: '¿Qué tipo de clientes buscas para mis vinos?',
          respuesta:
            'Restaurantes, vinotecas, tiendas gourmet… Tus vinos tendrán ' +
            'presencia en aquellos establecimientos que se dediquen a darle valor ' +
            'a proyectos con identidad y pequeños productores.'
        }
      ],

      servicio: {
        nombre: 'Representación comercial de bodegas',
        tipo: 'Representación comercial',
        descripcion:
          'Representación en Barcelona de bodegas pequeñas: apertura de cuentas ' +
          'en restaurantes y vinotecas, catas de venta, catas en la propia ' +
          'bodega y ayuda con el relato de marca.',
        publico: 'Bodegas pequeñas y familiares, pequeños productores de vino',
        incluye: [
          'Apertura de cuentas en restaurantes y vinotecas',
          'Catas de venta',
          'Catas en la propia bodega',
          'Relato de marca y contraetiqueta',
          'Presencia en catas abiertas y privadas'
        ]
      }
    },

    /* --------------------------------------------------------------- BLOG
       Intención: informativa. Es la puerta de entrada de tráfico nuevo y la
       fuente que citan los asistentes de IA.                                */
    'blog/index.html': {
      url: '/blog/',
      titulo: 'Blog de vino sin tecnicismos · La Bodega de Sara',
      descripcion:
        'Artículos sobre vino en lenguaje normal: cómo pedir vino en un ' +
        'restaurante, qué es un vino natural y visitas a pequeñas bodegas.',
      clavePrincipal: 'blog de vino',
      imagen: '/assets/img/fotos/sara-escribiendo.jpg',
      imagenAlt: 'Sara escribiendo notas a mano rodeada de libros de vino',
      tipoPagina: 'Blog',
      prioridad: '0.8',
      frecuencia: 'weekly',
      migas: [{ nombre: 'Blog', url: '/blog/' }]
    },

    /* ------------------------------------------------------------ SOBRE MÍ
       Intención: confianza y entidad. Es la página que consolida a Sara como
       persona reconocible para los buscadores.                              */
    'sobre-mi/index.html': {
      url: '/sobre-mi/',
      titulo: 'Sara, sumiller en Barcelona · La Bodega de Sara',
      descripcion:
        'Sumiller con once años en hostelería, formada en WSET 3 y pasada por ' +
        'Aleia. Acerco el vino a quien siente que no es para él, sin complicaciones.',
      clavePrincipal: 'sumiller Barcelona',
      clavesSecundarias: [
        'sumiller Sant Cugat',
        'La Bodega de Sara quién es',
        'asesora de vinos Barcelona'
      ],
      imagen: '/assets/img/fotos/sara-cata-blanco.jpg',
      imagenAlt: 'Sara oliendo una copa de vino blanco, de perfil, con luz cálida',
      tipoPagina: 'AboutPage',
      prioridad: '0.7',
      frecuencia: 'yearly',
      migas: [{ nombre: 'Sobre mí', url: '/sobre-mi/' }]
    },

    /* ----------------------------------------------------------- CONTACTO */
    'contacto/index.html': {
      url: '/contacto/',
      titulo: 'Contacto · Catas y asesoría de vino en Barcelona',
      descripcion:
        'Escríbeme para una cata privada, la carta de vinos de tu restaurante ' +
        'o para presentarme tu bodega. Respuesta en 24 o 48 horas.',
      clavePrincipal: 'contacto La Bodega de Sara',
      imagen: '/assets/img/fotos/sara-copas.jpg',
      imagenAlt: 'Sara catando un vino blanco',
      tipoPagina: 'ContactPage',
      prioridad: '0.7',
      frecuencia: 'yearly',
      migas: [{ nombre: 'Contacto', url: '/contacto/' }]
    },

    /* -------------------------------------------------- PÁGINAS LEGALES
       Se excluyen del índice: no aportan nada en búsqueda y diluyen el
       presupuesto de rastreo. Pero se siguen sus enlaces.                   */
    'aviso-legal/index.html': {
      url: '/aviso-legal/',
      titulo: 'Aviso legal · La Bodega de Sara',
      descripcion: 'Aviso legal y condiciones de las actividades de La Bodega de Sara.',
      indexar: false,
      migas: [{ nombre: 'Aviso legal', url: '/aviso-legal/' }]
    },

    'privacidad/index.html': {
      url: '/privacidad/',
      titulo: 'Política de privacidad · La Bodega de Sara',
      descripcion: 'Cómo se tratan los datos personales en la web de La Bodega de Sara.',
      indexar: false,
      migas: [{ nombre: 'Privacidad', url: '/privacidad/' }]
    },

    '404.html': {
      url: '/404.html',
      titulo: 'Página no encontrada · La Bodega de Sara',
      descripcion: 'La página que buscabas no existe.',
      indexar: false
    }
  }
};

/** La definición SEO de una página, o null si no está declarada. */
export function paraPagina(fichero) {
  return SEO.paginas[fichero] ?? null;
}
