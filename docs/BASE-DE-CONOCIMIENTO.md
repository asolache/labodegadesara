# La Bodega de Sara · Base de conocimiento

Todo lo que hay que saber para llevar la web, en un solo sitio.

Si sólo vas a hacer una cosa hoy, busca en esta tabla y ve directo:

| Quiero… | Ir a |
|---|---|
| Publicar un artículo nuevo | [§2](#2--publicar-un-artículo) |
| Editar un artículo ya publicado | [§3](#3--editar-un-artículo-publicado) |
| Retirar un artículo | [§4](#4--retirar-un-artículo) |
| Añadir o cambiar fotos | [§5](#5--fotos) |
| Añadir o cambiar una cata | [§6](#6--catas) |
| Cambiar un texto de la web | [§7](#7--qué-se-toca-y-dónde) |
| Que un cambio salga ya | [§8](#8--cuándo-se-ve-cada-cosa) |
| Algo no sale | [§9](#9--si-algo-no-sale) |

Documentos hermanos: [manual de Sara](MANUAL-SARA.md) ·
[operativa](OPERATIVA-CONTENIDOS.md) · [diseño](PROPUESTA-DISENO.md) ·
[SEO](SEO.md)

---

## 1 · Cómo funciona esto, en un minuto

Sara escribe en Google. Un proceso automático lo convierte en páginas web.

```
Google Sheets  «Catas»  ─┐
Google Sheets  «Blog»   ─┼──► sincronización ──► páginas publicadas
Google Docs    artículos ┘      (cada hora)
```

Tres ideas que explican todo lo demás:

1. **Sara no toca el código nunca.** Trabaja en una hoja de cálculo y en Google
   Docs, que ya usa a diario.
2. **La hoja manda.** Lo que no está en la hoja no está en la web. Lo que se
   escribe a mano en la web, la siguiente sincronización lo borra.
3. **Un artículo no existe hasta que se sincroniza.** Escribirlo en la hoja no
   lo publica: hace falta que la sincronización cree su página. Por eso lo que
   se ve en el listado siempre se puede abrir.

### Los enlaces de trabajo

| Qué | Dónde |
|---|---|
| Hoja de contenidos | https://docs.google.com/spreadsheets/d/1855lPpM2b3FG_D1kAitdqaf76YJmANXal9RAy7-7OBs/edit |
| Carpeta del blog en Drive | https://drive.google.com/drive/folders/1ACb_KZlT7sFyC_P4-srnCLSQU0DvYArZ |
| Repositorio | https://github.com/asolache/labodegadesara |
| Forzar publicación | Pestaña **Actions** → *Sincronizar contenido* → **Run workflow** |

---

## 2 · Publicar un artículo

Tres pasos. El segundo es el que más se olvida y el que más problemas da.

### Paso 1 · Escribir el artículo en Google Docs

Entra en la **carpeta del blog** y crea un documento nuevo. Escribe con
normalidad:

- **Negrita** para lo importante.
- Los estilos **«Título 1»** y **«Título 2»** del menú de Google Docs para
  separar apartados. Salen en la web con la tipografía de la marca.
- Listas con puntos o números.
- *Cursiva* para citas y matices.

No hace falta escribir el título dentro del documento: la web ya lo pone
arriba. Si lo escribes igualmente, se quita solo para que no salga dos veces.

### Paso 2 · Compartir el documento ⚠️

**Sin esto el artículo no se publica.** Es el fallo más habitual con
diferencia.

1. Botón **Compartir**, arriba a la derecha.
2. En «Acceso general», cambiar a **«Cualquier persona con el enlace»**.
3. Dejar el permiso en **«Lector»**.
4. **Copiar enlace**.

> Que sea «cualquier persona con el enlace» no significa que nadie vaya a
> encontrarlo suelto por internet. Sólo permite que la web pueda leerlo.

### Paso 3 · Apuntarlo en la hoja

En la **hoja de contenidos**, pestaña **Blog**, una fila nueva debajo de la
última:

| Columna | Qué se escribe | ¿Obligatorio? |
|---|---|---|
| **fecha** | `25/09/2026` o `2026-09-25` | Sí |
| **titulo** | El título del artículo | Sí |
| **documento** | **El enlace copiado en el paso 2** | Sí\* |
| **resumen** | Una o dos frases. Es lo que se lee en el listado y en Google | Sí |
| **categoria** | «Para entender», «Historias», «Para perder el miedo»… | No |
| **imagen** | La foto de portada — ver [§5](#5--fotos) | No |
| **alt** | Qué se ve en la foto, para quien no puede verla | No |
| **autor** | Por defecto, Sara | No |
| **publicar** | `NO` para dejarlo guardado sin publicar | No |

\* O bien `documento`, o bien escribir el texto en la columna `cuerpo`. Para
artículos largos, siempre Docs.

**El resumen importa más de lo que parece.** Es lo que aparece bajo el título
en los resultados de Google. Entre 120 y 155 caracteres es lo ideal: más corto
desaprovecha sitio, más largo se corta a la mitad.

Y ya está. En menos de una hora el artículo está publicado, con su página, su
dirección y su ficha para buscadores.

---

## 3 · Editar un artículo publicado

**Para cambiar el texto:** abre el Google Doc, edítalo y guarda. No hay que
tocar nada más; la web coge la versión nueva en la siguiente sincronización.

**Para cambiar el título, el resumen, la fecha o la foto:** se cambia en la fila
de la hoja.

⚠️ **Cuidado al cambiar el título.** La dirección del artículo se construye con
él:

```
«Cómo pedir vino en un restaurante»  →  /blog/como-pedir-vino-en-un-restaurante/
```

Si cambias el título, cambia la dirección, y quien tuviera el enlace guardado o
compartido se encontrará un error. Retocar una palabra es inofensivo; cambiar
el título entero de un artículo que lleva tiempo publicado, no. Si hace falta
hacerlo, díselo a Álvaro para que deje una redirección desde la dirección
antigua.

---

## 4 · Retirar un artículo

Escribe `NO` en la columna **publicar** de su fila.

En la siguiente sincronización desaparecen el artículo y su página, pero la
fila se queda en la hoja: si algún día quieres recuperarlo, vuelves a poner
`SÍ` y reaparece tal cual.

**No borres la fila** salvo que quieras perderlo de verdad.

---

## 5 · Fotos

### Dónde viven

Las fotos van dentro de la web, en `assets/img/fotos/`. **Las sube Álvaro**:
Sara se las pasa y él las coloca.

Una vez subida, en la columna `imagen` de la hoja se escribe su ruta:

```
/assets/img/fotos/nombre-de-la-foto.jpg
```

Fotos que ya están disponibles:

| Ruta | Qué se ve |
|---|---|
| `/assets/img/fotos/sara-copas.jpg` | Sara con cuatro copas, chaqueta de cuero |
| `/assets/img/fotos/sara-corcho.jpg` | Sara oliendo un corcho, camisa blanca |
| `/assets/img/fotos/sara-cata-blanco.jpg` | Sara oliendo una copa de blanco, de perfil |
| `/assets/img/fotos/sara-escribiendo.jpg` | Sara tomando notas entre libros |
| `/assets/img/fotos/carta-la-teresita.jpg` | Cartas de vino sobre una mesa |

Si un artículo no lleva foto, se deja la casilla vacía: la tarjeta se ve bien
igual.

### Cómo tienen que ser

- **Horizontales.** La portada de un artículo se recorta a formato apaisado; una
  foto vertical pierde la cabeza y los pies.
- **1600 píxeles de ancho como mucho.** Más grande no se ve mejor y hace la web
  más lenta.
- **Menos de 300 KB.** Si pesa más, hay que comprimirla antes de subirla.
- **Nombre en minúsculas, sin acentos ni espacios**: `cata-penedes-octubre.jpg`,
  no `Cata Penedès Octubre.JPG`.

### El texto alternativo (columna `alt`)

Describe lo que se ve, en una frase. Lo lee quien navega con lector de pantalla
y lo usa Google para entender la imagen.

- Bien: `Tres copas de vino tinto sobre una mesa de madera`
- Mal: `foto1`, `imagen de vino`, o dejarlo vacío

### Para añadir fotos nuevas (esto lo hace Álvaro)

1. Copiar el archivo a `assets/img/fotos/`, con nombre en minúsculas y sin
   acentos.
2. Comprobar que no pasa de 1600 px de ancho ni de 300 KB.
3. Confirmar y subir al repositorio.
4. Decirle a Sara la ruta exacta para que la pegue en la hoja.

---

## 6 · Catas

Pestaña **Catas** de la misma hoja. Una fila por cata, y ya está.

| Columna | Qué se escribe |
|---|---|
| **fecha** | `15/10/2026` o `2026-10-15` |
| **hora** | `19:30` |
| **titulo** | El nombre de la cata |
| **lugar** / **ciudad** | «La Teresita» / «Sant Cugat del Vallès» |
| **precio** | Sólo el número: `35`. El € lo pone la web |
| **plazas** | `14` |
| **estado** | `abierta`, `últimas`, `agotado` o `cancelada` |
| **descripcion** | Dos o tres frases de qué va |
| **reserva** | El enlace donde se reserva o se paga |
| **publicar** | `NO` para esconderla sin borrarla |

Cosas que pasan solas:

- **Las catas pasadas se archivan.** Al llegar la fecha salen de «Próximas
  catas» y bajan a la lista de abajo.
- **`agotado`** saca el cartel de «Completa», que anima a reservar antes la
  próxima vez.
- **`cancelada`** la quita de la web pero la deja en la hoja.
- Las catas son lo único que se ve **casi al momento**: refrescando la página
  suele bastar.

---

## 7 · Qué se toca y dónde

La regla que evita perder trabajo: **cada cosa se edita en un único sitio.** Si
se edita en otro, la sincronización la sobreescribe.

| Quiero cambiar… | Se toca en… | Quién |
|---|---|---|
| Un artículo | Su Google Doc | Sara |
| Título, resumen, fecha o foto de un artículo | La hoja, pestaña Blog | Sara |
| Una cata | La hoja, pestaña Catas | Sara |
| Un texto de una página (titular, párrafo) | El HTML de esa página | Álvaro |
| El menú, el pie, el lema | `parciales/cabecera.html`, `parciales/pie.html` | Álvaro |
| Título o descripción para Google | `seo/paginas.js` | Álvaro |
| **Las preguntas frecuentes** | `seo/paginas.js`, bloque `faq` | Álvaro |
| Fotos | `assets/img/fotos/` | Álvaro |

> **Las preguntas frecuentes tienen truco.** Aunque se vean en la página, no se
> editan ahí: salen a la vez en la web y en la ficha que lee Google, y las dos
> tienen que decir exactamente lo mismo. Ya pasó una vez que se escribieron en
> la página y se perdieron en la siguiente sincronización. Si Sara quiere
> cambiar una, se lo dice a Álvaro.

En el código, esas zonas llevan un aviso encima:

```html
<!-- NO EDITAR AQUÍ · Estas preguntas se escriben en seo/paginas.js … -->
```

---

## 8 · Cuándo se ve cada cosa

| Qué | Cuándo aparece |
|---|---|
| Una cata nueva o cambiada | Casi al momento |
| Un artículo nuevo | En menos de una hora |
| Un artículo corregido | En menos de una hora |
| Cambios en el código | Al subirlos, en un par de minutos |

La sincronización corre **cada hora en el minuto 17**, y también cada vez que
se sube algo al repositorio.

**Para que salga ya**, sin esperar: GitHub → pestaña **Actions** →
*Sincronizar contenido* → botón **Run workflow**. Tarda unos 30 segundos.

---

## 9 · Si algo no sale

### Un artículo no aparece

Por orden de probabilidad:

1. **¿Está compartido el Google Doc?** «Cualquier persona con el enlace». Es la
   causa en nueve de cada diez casos.
2. ¿Está pegado el enlace en la columna `documento`?
3. ¿Pone `NO` en `publicar`?
4. ¿Ha pasado ya la sincronización? Si hay prisa, fuérzala (§8).

### Un artículo aparece en el listado pero al abrirlo da error

No debería poder pasar: hay una comprobación que lo impide antes de publicar.
Si pasa, avisa a Álvaro — es un fallo, no un despiste.

### Una cata no aparece

1. ¿La fecha ya pasó? Está abajo, en «Por aquí hemos pasado».
2. ¿Pone `NO` en `publicar` o `cancelada` en `estado`?
3. ¿La fecha está bien escrita? `15/10/2026` o `2026-10-15`.

### Cambié un texto en la web y ha vuelto al anterior

Lo editaste en un sitio que se regenera. Mira la tabla de §7 y cámbialo en la
fuente que manda.

### Nada de la web funciona

Suele ser cosa del alojamiento, no del contenido. Álvaro:
`node scripts/comprobar.mjs` para descartar el contenido, y luego el panel de
Netlify.

---

## 10 · Lo que nunca hay que hacer en la hoja

- ❌ Borrar la primera fila de una pestaña (los títulos de las columnas).
- ❌ Cambiar el nombre de las pestañas: **Catas** y **Blog**.
- ❌ Cambiar el orden de las columnas.
- ❌ Borrar una pestaña entera.

Todo lo demás se puede deshacer: **Archivo → Historial de versiones**.

---

## 11 · Para Álvaro

```bash
node scripts/servidor.mjs     # ver la web en local, http://localhost:4173
node scripts/sync.mjs         # traer el contenido y regenerar
node scripts/comprobar.mjs    # validar antes de publicar
```

`comprobar.mjs` falla si: hay enlaces internos rotos, un artículo del listado no
tiene página, faltan textos alternativos, hay títulos o descripciones repetidos,
los datos estructurados no son válidos, o una pregunta frecuente está declarada
pero no se ve en la página. Corre en cada sincronización automática, así que una
regresión no llega a publicarse.

### Cosas aprendidas por las malas

- **No listar nada que no tenga página.** El listado del blog se sirve del
  fichero que la sincronización escribe junto con las páginas, nunca en vivo
  desde la hoja: si no, aparecen enlaces a artículos que aún no existen.
- **No redirigir el subdominio de Netlify al dominio propio a mano.** Mandaba
  toda la web a un dominio que todavía no estaba conectado. Netlify ya lo hace
  solo, y sólo cuando el dominio responde.
- **Las preguntas frecuentes, en una sola fuente.** Se ven en la página y se
  declaran para Google; si se editan por separado acaban diciendo cosas
  distintas, y eso Google lo penaliza.
- **Google Docs mete basura al exportar.** El nombre de la pestaña («Pestaña
  1») y el título repetido se limpian solos al descargar.
