# Operativa de contenidos

Cómo se monta y se mantiene el circuito que va desde lo que Sara escribe en
Google hasta lo que se ve publicado. Este documento es para quien lleva la parte
técnica; el de Sara es [MANUAL-SARA.md](MANUAL-SARA.md).

---

## 1 · La idea en una imagen

```
   Sara escribe                 Se sincroniza                  Se publica
   ───────────────              ──────────────                 ──────────

   Google Sheets ─┐
     · Catas      │
     · Blog       ├──► scripts/sync.mjs ──► /data/*.json ──► HTML estático
                  │      (GitHub Action)    /blog/*.html      en el alojamiento
   Google Docs ───┘                         sitemap · rss
     · artículos
```

Dos principios que explican todas las decisiones:

1. **Sara nunca ve el repositorio.** Trabaja en Sheets y Docs, que ya usa a
   diario. Cero herramientas nuevas, cero contraseñas nuevas.
2. **La web publicada no depende de Google.** La sincronización deja el
   contenido escrito dentro del HTML. Si mañana Google cambia algo o la hoja se
   despublica, la web sigue online exactamente igual. Google es la fuente de
   edición, no una dependencia en tiempo de ejecución.

---

## 2 · Montaje inicial

### 2.1 · La hoja de cálculo

1. Crea una hoja en el Drive de Sara: **«La Bodega de Sara · Contenidos»**.
2. Crea dos pestañas, con estos nombres exactos: **Catas** y **Blog**.
3. Importa las cabeceras y los ejemplos desde las plantillas del repositorio:
   - `docs/plantillas/catas.csv`
   - `docs/plantillas/blog.csv`

   (*Archivo → Importar → Subir*, y elige **Insertar hojas nuevas**.)
4. Dale a Sara permiso de **edición** y déjala como propietaria si procede.

**Recomendado:** protege la fila 1 de cada pestaña para que no se borre sin
querer (*Datos → Hojas y rangos protegidos*). Es el único error de Sara que no
se arregla solo.

### 2.2 · Publicar cada pestaña

Por cada pestaña (**Catas** y **Blog**):

*Archivo → Compartir → Publicar en la web*
→ selecciona **esa pestaña concreta** (no «todo el documento»)
→ formato **Valores separados por comas (.csv)**
→ **Publicar** → copia el enlace.

Pega los dos enlaces en `assets/js/config.js`:

```js
hojas: {
  catas: 'https://docs.google.com/spreadsheets/d/e/…&gid=0&single=true&output=csv',
  blog:  'https://docs.google.com/spreadsheets/d/e/…&gid=12345&single=true&output=csv',
  textos: ''
}
```

> Publicar en la web **no** hace pública la hoja de edición: expone sólo una
> copia de lectura de esa pestaña. Aun así, no metas datos personales de
> clientes en estas dos pestañas. Para eso, otra pestaña sin publicar.

### 2.3 · La carpeta del blog

1. Crea una carpeta en Drive: **«Blog · La Bodega de Sara»**.
2. Cada artículo es un Google Doc dentro de esa carpeta.
3. Cada documento debe compartirse como **«Cualquier persona con el enlace ·
   Lector»**, y su enlace va en la columna `documento` de la pestaña Blog.

La sincronización descarga cada documento usando la exportación a markdown que
ofrece Google (`/export?format=markdown`), así que los estilos «Título 1»,
«Título 2», las negritas y las listas llegan convertidos y limpios. No hay que
copiar y pegar nada.

**Alternativa sin Docs:** si un artículo es muy corto, se puede escribir
directamente en la columna `cuerpo` de la hoja, en markdown sencillo. Si las dos
columnas están rellenas, manda `documento`.

---

## 3 · Sincronizar

### A mano

```bash
node scripts/sync.mjs      # trae el contenido y regenera las páginas
node scripts/comprobar.mjs # valida el HTML antes de publicar
node scripts/servidor.mjs  # míralo en http://localhost:4173
```

La sincronización es **idempotente**: ejecutarla dos veces seguidas produce
exactamente el mismo resultado, así que no genera cambios espurios en git.

### Automática

`.github/workflows/sincronizar.yml` ejecuta la sincronización cada hora, y
además se puede lanzar a mano desde la pestaña **Actions** de GitHub (botón
*Run workflow*). Si hay cambios, los confirma y los sube; el alojamiento
despliega solo.

Es decir: **Sara escribe y, como mucho una hora después, está publicado.** Si
hace falta antes, se pulsa el botón.

### Si algo falla

La sincronización está escrita para no romper nada nunca:

| Qué pasa | Qué hace |
|---|---|
| La hoja no responde | Conserva los datos anteriores y avisa |
| Un Google Doc no es público | Mantiene la versión anterior del artículo |
| Un artículo nuevo sin acceso | Lo omite y sigue con el resto |
| Una fila sin título | La ignora |

Nunca deja la web a medias ni borra contenido bueno por un fallo de red.

---

## 4 · Refresco en vivo

En `config.js`, `refrescoEnVivo: true` hace que el navegador consulte también la
hoja al cargar la página. Sirve para que Sara vea un cambio **al instante**, sin
esperar a la sincronización.

- Afecta sobre todo a las **catas**, que son las que cambian a menudo.
- El contenido del repositorio se pinta primero, así que la página nunca se
  queda en blanco esperando a Google.
- Si la hoja no contesta, no pasa nada: se queda lo que ya había.
- Si algún día notas lentitud, ponlo en `false`. La web sigue funcionando igual,
  sólo que los cambios tardarán lo que tarde la sincronización.

---

## 5 · Reservas y cobros

La columna `reserva` de cada cata admite cualquier enlace, así que se puede
empezar simple e ir subiendo de nivel sin tocar la web:

| Nivel | Herramienta | Cuándo |
|---|---|---|
| Mínimo | Un **Google Form** por cata, o uno general | Para empezar hoy mismo |
| Intermedio | Formulario + pago por Bizum/transferencia | Cuando haya volumen |
| Recomendado | **Cobro online** (Stripe Payment Link, SumUp, Eventbrite) | Cuando la cata se llene sola |

Cobrar por adelantado reduce muchísimo las ausencias de última hora, que en
grupos de 12–14 personas se notan en la caja. Si se usa un Google Form, conviene
que sus respuestas caigan en una pestaña **aparte** de la hoja de contenidos
(esa sí, sin publicar), porque ahí ya hay datos personales.

---

## 6 · El formulario de contacto

En `config.js`, `formulario.modo` admite tres valores:

| Modo | Qué hace | Cuándo usarlo |
|---|---|---|
| `mailto` | Abre el correo del visitante con el mensaje escrito | Por defecto. Funciona sin dar de alta nada |
| `formspree` | Envía y le llega un email a Sara | **Recomendado**. Plan gratuito suficiente |
| `netlify` | Formularios nativos de Netlify | Si se aloja en Netlify |

Para Formspree: crea el formulario, copia el endpoint y ponlo en
`formulario.endpoint`, con `modo: 'formspree'`.

Para Netlify hay que añadir además, en el `<form>` de `contacto.html`:

```html
<form data-formulario name="contacto" method="POST"
      data-netlify="true" netlify-honeypot="web">
  <input type="hidden" name="form-name" value="contacto">
```

El formulario ya trae un campo trampa contra robots y valida en castellano.

---

## 7 · Publicar la web

No hay compilación: son ficheros estáticos. Sirve cualquier alojamiento.

**Recomendado: Netlify.** Conecta el repositorio y listo.

- Comando de compilación: *(vacío)*
- Carpeta a publicar: `.` (la raíz)

Vale igual Vercel, Cloudflare Pages o GitHub Pages.

**Al conectar el dominio definitivo**, acuérdate de cambiar `dominio` en
`config.js` y volver a sincronizar: de ahí salen las direcciones canónicas, el
sitemap y los datos estructurados.

---

## 8 · Mantenimiento

| Cuándo | Qué |
|---|---|
| Cada semana | Un vistazo a que las catas de la web cuadran con la realidad |
| Cada mes | `node scripts/comprobar.mjs` y repasar los avisos |
| Cada temporada | Revisar textos de las páginas fijas con Sara |
| Al añadir fotos | Redimensionar a 1600 px de ancho como mucho y guardar en `assets/img/fotos/` |

### Pendiente de rellenar

- [ ] Datos fiscales en `aviso-legal.html` y `privacidad.html` (están marcados
      con `[NOMBRE Y APELLIDOS DE SARA]`, `[NIF]`, `[DIRECCIÓN FISCAL]`).
- [ ] Correo real en `config.js` (`emailUsuario` y `emailDominio`).
- [ ] Dominio definitivo en `config.js`.
- [ ] Validar con Sara el caso de La Teresita de `restaurantes.html`, y las
      condiciones de cancelación del aviso legal.
- [ ] Sustituir las catas y artículos de ejemplo por los reales.
