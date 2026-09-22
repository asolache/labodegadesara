# Cómo actualizar tu web

Sara, esto es todo lo que necesitas saber. **No hay que tocar nada de programación.**

Trabajas en dos sitios que ya conoces: una **hoja de cálculo de Google** para las
catas, y **Google Docs** para escribir los artículos del blog. Nada más.

---

## Lo primero: tus dos enlaces

Guárdalos en favoritos. Son los únicos que vas a usar:

| Qué es | Para qué sirve | Enlace |
|---|---|---|
| **Hoja de contenidos** | Catas y lista de artículos | *https://docs.google.com/spreadsheets/d/1855lPpM2b3FG_D1kAitdqaf76YJmANXal9RAy7-7OBs/edit?gid=1865165858#gid=1865165858)* |
| **Carpeta del blog** | Donde escribes los artículos | *https://drive.google.com/drive/folders/1ACb_KZlT7sFyC_P4-srnCLSQU0DvYArZ* |

---

## Añadir una cata nueva

1. Abre la **hoja de contenidos** y ve a la pestaña **Catas**.
2. Escribe una fila nueva **debajo de la última**.
3. Ya está. En un rato aparecerá en la web, sola.

### Qué va en cada columna

| Columna | Qué escribir | ¿Obligatorio? |
|---|---|---|
| **fecha** | `15/10/2026` o `2026-10-15` | Sí |
| **hora** | `19:30` | No |
| **titulo** | El nombre de la cata | Sí |
| **lugar** | «La Teresita», «Bodega Tal»… | No |
| **ciudad** | Barcelona, Vilafranca… | No |
| **precio** | Sólo el número: `35`. El € lo pone la web | No |
| **plazas** | Cuántas hay: `14` | No |
| **estado** | `abierta`, `últimas`, `agotado` o `cancelada` | No |
| **publico** | «Todos los niveles», «Para curiosos»… | No |
| **descripcion** | Dos o tres frases contando de qué va | No |
| **reserva** | El enlace donde se reserva o se paga | No |
| **destacada** | `SÍ` si quieres que salga la primera | No |
| **publicar** | `NO` para esconderla sin borrarla | No |

### Cosas que conviene saber

- **Las catas pasadas desaparecen solas.** Cuando llega la fecha, la cata se va
  de «Próximas catas» y pasa a la lista de abajo. No tienes que hacer nada.
- **Para cancelar una cata**, escribe `cancelada` en la columna *estado*: se
  quita de la web pero se queda en tu hoja por si la quieres recuperar.
- **Para esconder una cata que aún no quieres anunciar**, escribe `NO` en la
  columna *publicar*. Cuando esté lista, cámbialo por `SÍ`.
- **Si se llena**, escribe `agotado` en *estado*. Sale en la web con el cartel de
  «Completa», que además anima a la gente a apuntarse antes la próxima vez.
- **No borres la primera fila** (la de los títulos de las columnas).
- **No cambies el orden de las columnas.** Añadir filas, todas las que quieras.

---

## Escribir un artículo del blog

Los artículos se escriben en **Google Docs**, como escribirías cualquier cosa.

### Paso 1 · Escribe el artículo

1. Entra en la **carpeta del blog** y crea un documento nuevo.
2. Escribe con normalidad. Puedes usar:
   - **Negrita** para lo importante.
   - Los estilos **«Título 1»** o **«Título 2»** del menú de Google Docs para
     separar apartados. Salen en la web con la tipografía bonita.
   - Listas con puntos o con números.
   - *Cursiva* para citas o matices.
3. Escribe con tu voz. Frases cortas, sin tecnicismos. Como se lo contarías a
   alguien en una mesa.

### Paso 2 · Comparte el documento

Esto es **imprescindible**, si no la web no puede leerlo:

1. Botón **Compartir** (arriba a la derecha).
2. Donde pone «Acceso general», cambia a **«Cualquier persona con el enlace»**.
3. Deja el permiso en **«Lector»**.
4. Pulsa **Copiar enlace**.

> No te preocupes: que sea «cualquier persona con el enlace» no significa que
> nadie vaya a encontrarlo. Sólo permite que tu web lo lea.

### Paso 3 · Apúntalo en la hoja

Vuelve a la **hoja de contenidos**, pestaña **Blog**, y añade una fila:

| Columna | Qué escribir |
|---|---|
| **fecha** | La fecha de publicación |
| **titulo** | El título del artículo |
| **categoria** | «Para entender», «Historias», «Para perder el miedo»… |
| **resumen** | Una o dos frases. Es lo que se lee en el listado y en Google |
| **imagen** | La foto de portada (mira abajo cómo se ponen fotos) |
| **alt** | Qué se ve en la foto, para quien no puede verla |
| **documento** | **El enlace que copiaste en el paso 2** |
| **publicar** | `SÍ` |

Y ya está. La web se encarga del resto.

### Para corregir un artículo ya publicado

Edita el Google Doc y guarda. **No hace falta tocar nada más**: la próxima vez
que la web se actualice, coge la versión nueva.

---

## Poner fotos

Las fotos tienen que estar dentro de la web. Pásaselas a Álvaro y él las sube;
luego te dirá qué hay que escribir en la columna *imagen*, que será algo así:

```
/assets/img/fotos/nombre-de-la-foto.jpg
```

Si un artículo no lleva foto, déjalo en blanco: no pasa nada, la tarjeta se ve
bien igual.

**Un consejo:** las fotos horizontales funcionan mejor como portada de artículo.
Las verticales se recortan por arriba y por abajo.

---

## ¿Cuándo se ven los cambios en la web?

- **Las catas**, casi al momento: refresca la página y ya están.
- **Los artículos nuevos**, en menos de una hora. La web se revisa sola cada
  cierto tiempo.
- Si tienes prisa por publicar algo, dile a Álvaro y lo fuerza en un minuto.

---

## Si algo no sale

Antes de preocuparte, repasa esto:

**Una cata no aparece**
- ¿La fecha ya ha pasado? Entonces está abajo, en «Por aquí hemos pasado».
- ¿Pone `NO` en la columna *publicar*?
- ¿Está bien escrita la fecha? Tiene que ser `15/10/2026` o `2026-10-15`.

**Un artículo no aparece**
- ¿Compartiste el documento como «cualquier persona con el enlace»? Es el fallo
  más habitual con diferencia.
- ¿Pegaste el enlace en la columna *documento*?
- ¿Pusiste `SÍ` en *publicar*?

**Sigue sin salir** → escribe a Álvaro y dile cuál es la fila. No toques nada
más: no se rompe nada por dejarlo como está.

---

## Lo que nunca hay que hacer

- ❌ Borrar la primera fila de una pestaña (la de los títulos).
- ❌ Cambiar el nombre de las pestañas (**Catas** y **Blog**).
- ❌ Cambiar el orden de las columnas.
- ❌ Borrar una pestaña entera.

Todo lo demás se puede deshacer. Si te equivocas, Google Sheets guarda el
historial: **Archivo → Historial de versiones**.
