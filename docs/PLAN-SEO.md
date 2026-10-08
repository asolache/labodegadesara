# Plan de acción · SEO y visibilidad en IA

Estado a 8 de octubre de 2026, con los datos de la web en producción.

La parte técnica está hecha ([SEO.md](SEO.md) explica qué y por qué). Lo que
queda **no es código**: es presencia local y contenido. Este documento dice qué
hacer, en qué orden y por qué.

---

## Dónde estamos

| | |
|---|---|
| Dominio | `labodegadesara.com`, conectado y sirviendo |
| Páginas indexables | 7 |
| Catas publicadas | 4 futuras, con precio, plazas, lugar y descripción |
| **Artículos** | **0** |
| Datos estructurados | Completos (negocio, Sara con WSET 3, servicios, eventos, FAQ) |
| Ficha de Google Business | Sin crear |
| Search Console | Sin dar de alta |

Dos agujeros que condicionan todo lo demás: **no hay ficha en Google** y **no
hay artículos**.

---

## 1 · Ficha de Google Business

**Lo que más mueve, con diferencia. Gratis y se tarda media hora.**

Para «catas de vino Barcelona» la mayoría de los clics se los lleva el bloque
de mapas. Sin ficha no se aparece ahí, por muy bien hecha que esté la web.

Al crearla:

- **Categoría principal:** «Organizador de eventos» o «Escuela de vino». La
  secundaria, «Enoteca» o «Consultor».
- **Nombre:** La Bodega de Sara. Tal cual, sin añadir palabras clave: Google
  penaliza los nombres inflados.
- **Zona de servicio:** Barcelona, Sant Cugat del Vallès, Vallès Occidental.
  Si no hay local abierto al público, se configura como negocio de servicio a
  domicilio, sin dirección visible.
- **Datos de contacto:** exactamente los mismos que en la web
  (`sara@vinosdulces.com`, `+34 622 680 905`). Que coincidan importa: Google
  cruza esos datos para confirmar que el negocio es real.
- **Descripción:** aprovechar la credencial. «Sumiller con WSET 3 y once años
  en hostelería, pasada por Aleia (dos estrellas Michelin)…».
- **Fotos:** las cinco que ya hay en la web, y las de cada cata.
- **Publicaciones:** cada cata nueva, como evento. Es gratis y aparece en el
  mapa.

> La web ya declara el negocio, la persona, la titulación y la zona en sus
> datos estructurados. Cuando la ficha diga lo mismo, las dos señales se
> refuerzan. Por eso conviene crearla con la web ya publicada, como es el caso.

## 2 · Search Console

Sin esto se trabaja a ciegas: no se sabe por qué búsquedas aparece la web ni
qué páginas se han indexado.

1. Alta en [Search Console](https://search.google.com/search-console) con la
   propiedad `labodegadesara.com`.
2. Enviar `https://labodegadesara.com/sitemap.xml`.
3. Pedir indexación de la portada y de `/catas/` desde la inspección de URL.
4. Alta también en [Bing Webmaster Tools](https://www.bing.com/webmasters):
   es rápido y **Bing alimenta a ChatGPT**, así que cuenta para la visibilidad
   en IA.

## 3 · Reseñas

Pedirlas después de cada cata, con el enlace directo a la ficha. Una frase al
despedirse y un mensaje al día siguiente.

Cuando haya unas cuantas, se añade `aggregateRating` a los datos estructurados
y aparecen las estrellas en los resultados. **Nunca antes de tenerlas, y nunca
inventadas**: es motivo de penalización.

## 4 · Enlace de reserva en las catas

Ninguna de las cuatro catas tiene nada en la columna `reserva`, así que el
botón dice «Quiero información» en lugar de llevar a reservar.

Es rellenar una columna, pero afecta a dos cosas: la gente que llega no puede
comprar, y el dato `offers.url` del evento se queda sin destino útil para
Google.

---

## 5 · El blog: el agujero de verdad

Hoy, un asistente que lea `https://labodegadesara.com/llms.txt` encuentra esto:

```
## Artículos
- (todavía no hay artículos publicados)
```

Eso es lo que ven ChatGPT, Claude, Perplexity y Gemini. Sin artículos no hay
nada que citar, y la web se queda en siete páginas de servicio.

**Objetivo realista: dos artículos al mes.** Con seis publicados empiezan a
llegar visitas de búsquedas que hoy no se captan.

### Cómo elegir de qué escribir

La mejor fuente son las preguntas que a Sara le hacen de verdad: por Instagram,
en las catas, en la mesa de La Teresita. Si alguien lo pregunta en voz alta, lo
está buscando en Google.

### Doce títulos listos para escribir

Ordenados por lo que antes dará resultado a una web nueva. Los primeros son de
cola larga: menos búsquedas, pero mucho más fáciles de ganar.

| # | Título | Qué busca la gente | Por qué este |
|---|---|---|---|
| 1 | Cuánto cuesta una cata de vinos en Barcelona | precio cata de vinos barcelona | Quien busca esto está a un paso de reservar. Lleva directo a `/catas/` |
| 2 | Qué es el vino naranja y por qué está en todas las cartas | vino naranja qué es | Mucha búsqueda, y Sara tiene una cata entera del tema en noviembre |
| 3 | Cava, champán y espumoso: en qué se diferencian de verdad | diferencia cava champán | De las dudas más buscadas del sector. Enlaza con la cata de diciembre |
| 4 | Cómo pedir vino en un restaurante sin sentirte un impostor | cómo pedir vino restaurante | El alma de la marca. Formato pregunta-respuesta, ideal para que lo citen |
| 5 | Cuánto dura una botella de vino abierta | cuánto dura el vino abierto | Pregunta constante, respuesta clara. Muy fácil de posicionar |
| 6 | Qué vino regalar sin quedar mal | qué vino regalar | Se dispara en noviembre y diciembre. Prepararlo en octubre |
| 7 | Priorat: por qué sus vinos cuestan lo que cuestan | vinos del priorat | Territorio con búsqueda propia, y hay cata en noviembre |
| 8 | Vino natural, ecológico y biodinámico: la diferencia | vino natural vs ecológico | Mucha confusión y poca explicación honesta. Encaja con el tono |
| 9 | A qué temperatura se sirve cada vino | temperatura servir vino | Con una tabla. Las tablas se citan mucho en respuestas de IA |
| 10 | Cómo montar una cata de vinos en casa | cata de vinos en casa | Capta a quien luego contrata una cata privada |
| 11 | Qué debe tener la carta de vinos de un restaurante | carta de vinos restaurante | El único B2B de la lista. Pocas búsquedas, pero valen mucho |
| 12 | Qué se bebe en Barcelona cuando no se bebe vermut | — | Marca y territorio. Para enlazar desde Instagram |

### Cómo escribirlos para que los citen las IA

- **El título, una pregunta o una promesa clara.** Así es como se busca.
- **Responder en el primer párrafo.** Nada de rodeos: si el título pregunta
  cuánto dura un vino abierto, la primera frase lo dice. Eso es lo que un
  asistente extrae y cita.
- **Apartados con «Título 2»**, cada uno respondiendo a una duda concreta.
- **Frases que se entiendan fuera de contexto**, porque se van a leer sueltas.
- **Datos concretos**: precios, días, grados, cantidades. Lo vago no se cita.
- **Entre 700 y 1.200 palabras.** Suficiente para decir algo, sin relleno.
- **Enlazar a `/catas/` cuando venga a cuento**, sin forzarlo.

El resumen de la hoja es importante: es lo que sale bajo el título en Google.
Entre 120 y 155 caracteres.

---

## 6 · Enlaces desde otras webs

Es la señal que más cuesta conseguir y la que más distingue. Por orden de
facilidad:

1. **Los restaurantes con los que trabaje.** Una línea en su web citando quién
   les lleva la carta, con enlace. La Teresita, la primera.
2. **Las bodegas que represente.** En su página de distribuidores.
3. **El espacio donde hace las catas** (Madera y Tiza): que la enlace al
   anunciarlas.
4. **Agendas culturales de Barcelona y Sant Cugat.** Publicar ahí cada cata.
5. **Medios locales de gastronomía.** Una nota contando el proyecto.

Un enlace desde la web de un restaurante conocido vale más que cualquier
ajuste técnico que quede por hacer.

---

## 7 · Lo que podría hacerse en el código

La única mejora técnica con recorrido real que queda:

**Una página propia por cata.** Hoy las cuatro viven dentro de `/catas/`,
compitiendo por una sola dirección genérica. Con página propia, «Orígenes del
vi brisat, hoy orange wine» o «El renacer del Priorat» pasan a ser contenido
indexable sobre temas con búsqueda y poca competencia local, cada uno con su
evento marcado, su descripción larga y su botón de reserva.

Encaja con el sistema actual: funcionaría igual que los artículos, generándose
desde la misma hoja. Es trabajo medio y toca producción, así que conviene
hacerlo con calma y verificándolo.

Lo demás ya está: canónicas, datos estructurados, `llms.txt`, `robots.txt`,
sitemap, velocidad, direcciones limpias y accesibilidad.

---

## Resumen

| Orden | Qué | Quién | Esfuerzo |
|---|---|---|---|
| 1 | Ficha de Google Business | Sara | 30 min |
| 2 | Search Console y Bing | Álvaro | 20 min |
| 3 | Enlace de reserva en las catas | Sara | 10 min |
| 4 | Pedir reseñas tras cada cata | Sara | Continuo |
| 5 | Dos artículos al mes | Sara | 2 h cada uno |
| 6 | Enlaces desde restaurantes y bodegas | Sara | Continuo |
| 7 | Página propia por cata | Álvaro | Cuando toque |

Lo de arriba da resultados en semanas. Lo de abajo, en meses. Por eso va en
este orden y no al revés.
