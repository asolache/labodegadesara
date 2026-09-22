# Propuesta de diseño

La Bodega de Sara · temporada otoño 2026

---

## 1 · El problema que resuelve la web

El plan estratégico lo dice con una frase: *acercar el vino a quienes sienten
que no es para ellos.* La web tiene que demostrar eso **antes de que nadie lea
una palabra**.

La mayoría de webs de vino hacen justo lo contrario: fondos negros, tipografías
finísimas, fotos de copas a contraluz sin una sola persona. Transmiten «esto es
para entendidos», que es exactamente la barrera que Sara quiere quitar.

Así que el diseño se construye sobre una tensión deliberada:

> **Elegante sin ser exclusiva.** Cuidada, para que se la tomen en serio los
> restaurantes y las bodegas. Cálida y con la cara de Sara en primer plano, para
> que quien tiene miedo a preguntar sienta que puede entrar.

---

## 2 · Decisiones visuales

### Color

La paleta sale directamente de la luz de las fotos de Sara: penumbra cálida,
foco dorado, cerámica y vino.

| Token | Color | Dónde se usa |
|---|---|---|
| `--c-crema` | `#faf6f0` | Fondo general. «Papel de carta», no blanco clínico |
| `--c-tinta` | `#2a211c` | Texto. Marrón muy oscuro, nunca negro puro |
| `--c-oro` | `#b47d2b` | Acento principal: la luz de las fotos |
| `--c-vino` | `#6b2333` | Botones de acción, cifras de fecha |
| `--c-penumbra` | `#191310` | Hero, pie y secciones de respiro |

**Nada de negro ni blanco puros.** Todo lleva temperatura. Es la diferencia
entre una marca acogedora y una marca fría, y se decide en el código de color.

El oro está reservado a lo que importa: antetítulos, filetes, el «Y no hace
falta» del hero. Si se usara en todo, dejaría de significar nada.

### Tipografía

- **Fraunces** para titulares. Serif variable, cálida, ligeramente irregular a
  propósito (`SOFT`, `WONK`). Tiene carácter artesanal: parece escrita por
  alguien, no generada. Es la voz de Sara.
- **Karla** para el texto. Sans humanista, muy legible en castellano, con
  personalidad pero sin gritar.

Serif para lo emocional y sans para lo informativo: la jerarquía se entiende sin
pensarla.

La escala es fluida (`clamp`): los tamaños se adaptan al ancho de pantalla sin
saltos bruscos entre móvil y escritorio.

### Fotografía

Las fotos de Sara son el activo más valioso de la marca y mandan sobre todo lo
demás. Por eso:

- El hero es **una foto a pantalla completa**, no un bloque de color.
- Sara aparece en casi todas las páginas. La marca es ella: personas, no copas.
- El velo del hero es un degradado en dos capas, calculado para que el texto
  tenga contraste suficiente **sin apagar la foto**.

### Ritmo

Secciones alternando fondo crema, fondo arena y fondo penumbra. La penumbra
aparece dos o tres veces por página como respiro: es donde va la promesa de
marca, y funciona como un silencio antes de una frase importante.

---

## 3 · Arquitectura

La web sirve a tres públicos con necesidades distintas, y el plan estratégico
los separa con claridad. La navegación los separa también:

```
Inicio ─── Catas ──────── B2C · experiencias públicas y privadas
       ├── Restaurantes ─ B2B · carta de vinos + formación de sala
       ├── Bodegas ────── B2B · representación comercial y catas en bodega
       ├── Blog ───────── captación y posicionamiento
       ├── Sobre mí ───── confianza (la marca es una persona)
       └── Contacto ───── conversión, con el motivo ya preseleccionado
```

**La home es un repartidor, no un catálogo.** Presenta a Sara, muestra las tres
puertas de entrada, enseña las próximas catas y deja ir. Cada visitante llega
buscando cosas muy distintas y lo que necesita es identificarse rápido.

Los botones de las páginas B2B llevan a `/contacto/?motivo=restaurante`, y el
formulario aparece con ese motivo ya elegido. Un paso menos, que en un
formulario es mucho.

### Por qué las páginas B2B están al mismo nivel que las B2C

Son las líneas de ingresos de ticket alto del plan. Esconderlas en un submenú
sería tratarlas como secundarias. Además, un restaurante que valora a Sara
quiere ver también las catas: la prueba de que sabe contar el vino en público
está justo al lado.

---

## 4 · Decisiones de contenido

**El tono de voz se aplica literalmente.** Titulares como «Nadie nace sabiendo
de vino. Y no hace falta» o «Aquí no hay nada servido» (en el error 404) están
escritos desde la personalidad definida en el plan: cercana, espontánea,
optimista, sin pretender impresionar.

**Las preguntas frecuentes de la página de catas atacan el miedo de frente.** La
primera es «No tengo ni idea de vino. ¿Voy a hacer el ridículo?». Es
exactamente lo que piensa el cliente ideal, y verlo escrito en la web —y
contestado sin condescendencia— hace más por la conversión que cualquier
argumento de venta.

**En restaurantes se habla de dinero sin rodeos**, porque ahí el interlocutor es
un negocio: ticket medio, margen, stock parado. Pero el argumento se sostiene en
la experiencia del cliente, no en la presión comercial.

**No hay cifras de resultados inventadas.** Ni «+23 % de ticket medio» ni
testimonios ficticios. Se explica el mecanismo por el que la cosa funciona y se
deja que el caso de La Teresita lo ilustre. Cuando haya datos reales, entrarán.

---

## 5 · Accesibilidad y estándares

Todo el marcado es HTML semántico válido según el W3C, sin frameworks.

- Enlace **«Saltar al contenido»** como primer tabulador.
- Contraste suficiente en todas las combinaciones de texto y fondo.
- Foco visible y consistente en toda la web.
- `prefers-reduced-motion` respetado: quien pide menos movimiento no ve ninguna
  animación.
- Todas las imágenes con texto alternativo descriptivo.
- Jerarquía de encabezados sin saltos, un `h1` por página.
- El menú de móvil se maneja con teclado y se cierra con `Esc`.
- La web **funciona sin JavaScript**: el contenido de catas y blog viaja escrito
  en el HTML. El JavaScript sólo mejora la experiencia, no la sostiene.

`node scripts/comprobar.mjs` valida buena parte de esto de forma automática.

---

## 6 · Rendimiento

- **Sin frameworks, sin compilación, sin dependencias.** El navegador descarga
  HTML, dos hojas de estilo y unos pocos módulos pequeños.
- Imágenes con `width` y `height` explícitos para que no salte la maquetación.
- Carga diferida en todo lo que está por debajo del primer pantallazo.
- Tipografías con `display=swap`, y una pila de respaldo del sistema decente por
  si Google Fonts tarda.
- Iconos en SVG dentro del propio HTML: cero peticiones extra.

**Pendiente**: comprimir las fotos originales (pesan entre 200 y 470 KB) y
generar versiones en WebP. Es la única mejora de rendimiento que queda
realmente pendiente.

---

## 7 · Lo que se decidió no hacer

| Descartado | Por qué |
|---|---|
| Tienda online | El plan no contempla venta de botellas. Añade fiscalidad, logística y mantenimiento para un ingreso que hoy no existe |
| Gestor de contenidos (WordPress, Decap) | Otra contraseña, otra interfaz y otra cosa que mantener. Sara ya vive en Google |
| Reservas con calendario propio | Un Google Form resuelve hoy el 100 % del caso. Cuando las catas se llenen solas, se sube a cobro online sin tocar la web |
| Modo oscuro | La marca es cálida y luminosa. Un modo oscuro duplicaría el trabajo de diseño sin aportar nada aquí |
| Analítica con cookies | Obligaría a poner un banner de consentimiento, que es justo la primera fricción que ve alguien que entra. Si hace falta medir, hay opciones sin cookies |
| Newsletter propia | Vale la pena, pero primero hay que tener a quién escribir. Va después de las cajas de Navidad |

---

## 8 · Siguientes pasos sugeridos

**Antes de publicar**
1. Rellenar datos fiscales en aviso legal y privacidad.
2. Correo y dominio definitivos en `config.js`.
3. Montar la hoja de Google y sustituir el contenido de ejemplo.
4. Validar con Sara los textos, sobre todo el caso de La Teresita.

**Primeras semanas**
5. Formspree para el formulario, en vez de `mailto`.
6. Cobro online de las catas.
7. Comprimir las fotos y añadir alguna más.

**Cuando haya rodaje**
8. Testimonios reales de clientes y restaurantes.
9. Página propia para las **cajas de Navidad**: es la gran campaña del año y
   merece su propia dirección, no un apartado dentro de otra página.
10. Newsletter, cuando haya lista que alimentar.
