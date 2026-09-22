# SEO y visibilidad en buscadores e IA

Cómo está planteado el posicionamiento de la web y dónde se toca cada cosa.

> **Todo el SEO se edita en un único fichero: [`seo/paginas.js`](../seo/paginas.js).**
> Títulos, descripciones, palabras clave, preguntas frecuentes y datos
> estructurados. Las páginas HTML sólo llevan un marcador `<!-- seo -->`; el
> sincronizador escribe el resto. No hay que buscar metaetiquetas por diez
> ficheros ni arriesgarse a que dos páginas acaben con la misma descripción.

---

## 1 · El planteamiento

Esta web compite en tres terrenos muy distintos a la vez:

| Terreno | Quién busca | Dificultad | Valor |
|---|---|---|---|
| **Local B2C** — «catas de vino Barcelona» | Particulares con curiosidad | Alta, hay competencia | Alto volumen |
| **B2B nicho** — «asesoría carta de vinos» | Restaurantes | Baja, poca competencia | Ticket muy alto |
| **Informativo** — «qué es un vino natural» | Cualquiera con una duda | Media | Capta y alimenta a las IA |

La estrategia tiene en cuenta que el negocio acaba de empezar y no tiene
autoridad de dominio: lo realista es ganar primero el **B2B nicho** y el
**informativo de cola larga**, que es donde no hay que pelearse con nadie, y
que el local B2C llegue después, apoyado en las reseñas de Google Business y
en la marca.

**Una intención de búsqueda por página.** Dos páginas que persiguen la misma
consulta se quitan posiciones entre ellas; por eso las catas viven sólo en
`/catas/` y la asesoría sólo en `/restaurantes/`.

---

## 2 · Palabras clave por página

| Página | Principal | Secundarias |
|---|---|---|
| `/` | catas de vino Barcelona | experiencias con vino, vino sin postureo |
| `/catas/` | catas de vino en Barcelona | cata privada, cata para empresas, cata a ciegas |
| `/restaurantes/` | asesoría carta de vinos restaurante | crear carta de vinos, formación en vinos para camareros |
| `/bodegas/` | representación comercial bodegas Barcelona | agente comercial de vinos, catas en bodega |
| `/blog/` | blog de vino | (cola larga por artículo) |
| `/sobre-mi/` | La Bodega de Sara | Sara vino Barcelona |

Los títulos llevan la palabra clave al principio, que es lo que se lee en el
resultado de búsqueda, y se quedan por debajo de 60 caracteres para que no se
corten. Las descripciones están escritas para que apetezca entrar, no para
repetir palabras: si Google no las encuentra convincentes, las reescribe él.

---

## 3 · Optimización para asistentes de IA

Cada vez más gente pregunta a ChatGPT, Claude, Perplexity o Gemini en lugar de
buscar en Google. Para que un asistente pueda recomendar este negocio, tiene
que poder entenderlo y citarlo. Eso se ha trabajado en cuatro frentes:

### `/llms.txt`

Un resumen del sitio en texto plano, siguiendo la convención de
[llmstxt.org](https://llmstxt.org). Un modelo lo lee y en veinte líneas sabe
qué es esto, a quién sirve, qué servicios hay, cuánto cuestan más o menos y a
qué página ir. Se genera solo en cada sincronización, así que nunca se queda
desfasado.

### Datos estructurados en grafo

Toda la web describe **un solo grafo** con dos entidades centrales:

```
#negocio (LocalBusiness) ←─ worksFor ─ #sara (Person)
     │
     ├─ hasOfferCatalog → los seis servicios
     ├─ knowsAbout      → los temas que domina
     └─ areaServed      → Barcelona y alrededores
```

Todas las páginas referencian esas entidades por su `@id` en lugar de repetir
los datos sueltos. Un buscador puede deducir del texto a qué se dedica Sara;
un modelo que resume la web agradece tenerlo declarado sin ambigüedad.

### Preguntas y respuestas

Las páginas de catas, restaurantes y bodegas llevan preguntas frecuentes
redactadas **como las formula la gente** y respondidas de forma
autocontenida, es decir, que se entienden fuera de contexto. Ese formato es
exactamente el que un asistente cita cuando alguien pregunta «¿hace falta
saber de vino para ir a una cata?».

Las preguntas visibles y las de los datos estructurados **salen de la misma
fuente**, así que no pueden decir cosas distintas. Declarar un `FAQPage` cuyo
contenido no está a la vista incumple las directrices de Google, y el
comprobador falla si eso llega a pasar.

### Acceso permitido, a propósito

`robots.txt` permite explícitamente el paso a GPTBot, ClaudeBot,
PerplexityBot, Google-Extended y compañía. Es una decisión de negocio: a una
marca que vive de que la descubran le interesa que la citen. Si algún día se
prefiere lo contrario, se cambian esas líneas por `Disallow`.

---

## 4 · SEO técnico

**Direcciones limpias.** `/catas/` en lugar de `/catas.html`, con cada página
en su propia carpeta. Funciona en cualquier alojamiento sin configuración, y
`netlify.toml` redirige las antiguas con un 301 por si quedó alguna enlazada.

**Una sola dirección por página.** Canónica absoluta en todas, comprobada
contra la ruta real del fichero: si no coinciden, el comprobador da error.

**El contenido viaja en el HTML.** Las catas y los artículos se escriben
dentro de la página durante la sincronización, así que un rastreador que no
ejecute JavaScript —que son la mayoría de los de IA— lo ve todo igual.

**Velocidad.** Sin frameworks ni compilación; la imagen principal de la
portada se precarga porque es la que Google mide como LCP; todas las imágenes
llevan medidas para que no salte la maquetación; caché larga para las fotos y
revalidación en las páginas.

**Indexación.** `max-image-preview:large` para que Google pueda mostrar las
fotos grandes en los resultados, que a una marca visual le conviene. Las
páginas legales y el 404 van con `noindex, follow`.

---

## 5 · Qué comprueba el validador

`node scripts/comprobar.mjs` falla si:

- Falta la canónica, no es absoluta o no coincide con la ruta del fichero.
- Dos páginas comparten título o descripción.
- Una página indexable no tiene datos estructurados, o su JSON es inválido.
- Hay una entidad sin `@type`.
- Un `FAQPage` declara una pregunta que no se ve en la página.
- Un evento no tiene fecha de inicio o lugar.
- Falta un `h1`, hay más de uno o la jerarquía de encabezados da saltos.
- Una imagen no tiene texto alternativo.
- Un enlace interno apunta a una página que no existe.

Se ejecuta en cada sincronización automática, así que una regresión de SEO no
llega a publicarse.

---

## 6 · Lo que falta y no depende del código

El SEO técnico está hecho. Lo que queda son cosas del mundo real, y pesan más
que cualquier metaetiqueta:

1. **Ficha de Google Business.** Para «catas de vino Barcelona» es, con
   diferencia, lo más importante. Sin ficha no se aparece en el mapa, que es
   donde mira todo el mundo. Es gratis y se tarda un rato.
2. **Reseñas reales.** Pedirlas después de cada cata. Cuando haya unas
   cuantas, se añade `aggregateRating` a los datos estructurados — **nunca
   antes, y nunca inventadas**: eso sí es motivo de penalización.
3. **Dar de alta el sitio** en Google Search Console y Bing Webmaster Tools, y
   enviar el sitemap.
4. **Ritmo en el blog.** Dos artículos al mes que respondan preguntas reales
   valen más que cualquier ajuste técnico. Cada duda que le llegue a Sara por
   Instagram es un artículo con búsquedas garantizadas.
5. **Menciones y enlaces.** Los restaurantes con los que trabaje, las bodegas
   que represente y los medios locales de gastronomía. Un enlace desde la web
   de un restaurante conocido vale más que cien ajustes de metaetiquetas.
6. **Confirmar la titulación.** Si Sara tiene título oficial de sumillería,
   decirlo cambia bastante: «sumiller en Barcelona» tiene mucho más volumen de
   búsqueda que las alternativas. Pero sólo si es cierto.

---

## 7 · Cómo tocar el SEO

Todo está en `seo/paginas.js`:

```js
'catas/index.html': {
  url: '/catas/',
  titulo: 'Catas de vino en Barcelona · Agenda y catas privadas',
  descripcion: '…',
  clavePrincipal: 'catas de vino en Barcelona',
  faq: [ { pregunta: '…', respuesta: '…' } ],
  servicio: { … }
}
```

Se cambia lo que haga falta y se ejecuta:

```bash
node scripts/sync.mjs        # reparte los cambios por las páginas
node scripts/comprobar.mjs   # valida que no se ha roto nada
```

### Herramientas para verificar en producción

- [Prueba de resultados enriquecidos](https://search.google.com/test/rich-results) de Google
- [Validador de schema.org](https://validator.schema.org/)
- PageSpeed Insights, para las métricas de velocidad
- Google Search Console, una vez dado de alta el dominio
