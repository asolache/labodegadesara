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
 * REVISAR CON SARA
 * ---------------------------------------------------------------------------
 * · `persona.puesto`: si tiene titulación oficial de sumillería, conviene
 *   decirlo aquí y en los textos. «Sumiller en Barcelona» tiene muchísimas
 *   más búsquedas que cualquier alternativa, pero sólo se puede usar si es
 *   cierto.
 * · `rangoPrecios` y `zonas`: ajustar a la realidad.
 * · Cuando haya reseñas reales (Google Business), añadir aggregateRating.
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
  lema: 'Vino sin postureo',

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

  zonas: ['Barcelona', 'Área metropolitana de Barcelona', 'Cataluña'],

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

  persona: {
    nombre: 'Sara',
    // Descriptivo y comprobable. Ver la nota de arriba sobre la titulación.
    puesto: 'Divulgadora de vino y asesora de cartas para restaurantes',
    descripcion:
      'Acerca el vino a quienes sienten que no es para ellos, a través de ' +
      'catas sin tecnicismos, asesoría de cartas para restaurantes y la ' +
      'representación de pequeños productores.',
    imagen: '/assets/img/fotos/sara-cata-blanco.jpg'
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
        '6 personas. Grupos pequeños, para todos los niveles y sin postureo.',
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
          pregunta: 'No tengo ni idea de vino. ¿Voy a hacer el ridículo?',
          respuesta:
            'No. La mayoría de quien viene está igual. En estas catas no se ' +
            'examina a nadie: se prueba, se opina y se puede decir «este no me ' +
            'gusta» sin que pase nada. No hace falta ningún conocimiento previo.'
        },
        {
          pregunta: '¿Puedo ir sola o solo a una cata de vino?',
          respuesta:
            'Sí, y ocurre a menudo. Los grupos son pequeños, de unas 12 a 14 ' +
            'personas, así que en pocos minutos ya está todo el mundo hablando. ' +
            'Es una buena manera de conocer gente con la misma curiosidad.'
        },
        {
          pregunta: '¿Qué se come durante la cata?',
          respuesta:
            'Siempre hay algo que acompaña: quesos, conservas, embutido o lo que ' +
            'pida el vino de ese día. No es una cena, pero nadie se queda con ' +
            'hambre. Las alergias e intolerancias se avisan al reservar.'
        },
        {
          pregunta: '¿Se puede cancelar una reserva de cata?',
          respuesta:
            'Sí. Avisando con 48 horas de antelación se devuelve el importe o se ' +
            'traslada la plaza a otra fecha. Con menos margen las botellas ya ' +
            'están compradas, así que sólo se puede cambiar la fecha.'
        },
        {
          pregunta: '¿Hacéis catas de vino para empresas?',
          respuesta:
            'Sí. Las catas para empresas y equipos se adaptan al número de ' +
            'personas, al espacio y al presupuesto, y se pueden hacer en la ' +
            'propia oficina o en un espacio alquilado en Barcelona.'
        },
        {
          pregunta: '¿Cuánto cuesta una cata de vino?',
          respuesta:
            'Las catas abiertas en Barcelona están normalmente entre 30 y 40 ' +
            'euros por persona, según los vinos y el acompañamiento. Las catas ' +
            'privadas se presupuestan según el grupo y el lugar.'
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
          pregunta: '¿Cuánto se tarda en rehacer la carta de vinos de un restaurante?',
          respuesta:
            'Un encargo completo suele llevar entre cuatro y seis semanas, según ' +
            'el tamaño de la carta y lo rápido que se puedan catar las ' +
            'referencias con los platos del restaurante.'
        },
        {
          pregunta: '¿Se puede contratar sólo la formación del equipo de sala?',
          respuesta:
            'Se puede, pero funciona mejor junto con la carta. El equipo aprende ' +
            'a vender los vinos que tiene delante, así que la formación rinde ' +
            'más cuando la carta está pensada para poder contarse.'
        },
        {
          pregunta: '¿Cómo ayuda una carta de vinos a subir el ticket medio?',
          respuesta:
            'La botella se decide en la mesa, no en la carta. Cuando la sala ' +
            'sabe recomendar, el cliente acaba eligiendo un vino mejor del que ' +
            'habría pedido solo, y se va más satisfecho. Además, trabajar con ' +
            'productores pequeños mejora el margen, porque son referencias que ' +
            'el cliente no puede comparar en el móvil.'
        },
        {
          pregunta: '¿Trabajáis con restaurantes fuera de Barcelona?',
          respuesta:
            'La base de trabajo es Barcelona y su área metropolitana. Fuera de ' +
            'ahí se estudia caso por caso, según el proyecto y los ' +
            'desplazamientos que requiera.'
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
          pregunta: '¿Cómo empieza la colaboración?',
          respuesta:
            'La bodega envía sus vinos para catarlos con calma y recibe una ' +
            'opinión sincera. Si encaja, se acuerdan por escrito zona, ' +
            'exclusividad, precios y objetivos, y a partir de ahí empiezan las ' +
            'visitas comerciales y las catas de venta.'
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
      titulo: 'Sobre mí · Sara, de La Bodega de Sara',
      descripcion:
        'Soy Sara y acerco el vino a quien siente que no es para él: catas sin ' +
        'postureo, cartas con identidad y pequeños productores con nombre.',
      clavePrincipal: 'La Bodega de Sara quién es',
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
