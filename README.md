# La Bodega de Sara

Web de catas, asesoría de cartas de vino y representación de bodegas, en
Barcelona.

HTML, CSS y JavaScript estándar. **Sin frameworks, sin compilación y sin ninguna
dependencia**: lo que hay en el repositorio es exactamente lo que sirve el
alojamiento. El contenido se edita desde Google Sheets y Google Docs, sin tocar
código.

---

## Empezar

```bash
node scripts/servidor.mjs     # http://localhost:4173
```

No hay `npm install`. Sólo hace falta Node 18 o superior.

## Comandos

| Comando | Qué hace |
|---|---|
| `node scripts/servidor.mjs` | Servidor local para ver la web |
| `node scripts/sync.mjs` | Trae el contenido de Google y regenera las páginas |
| `node scripts/comprobar.mjs` | Valida el HTML: enlaces, accesibilidad, metadatos |
| `node scripts/semilla.mjs` | Regenera los datos de ejemplo desde `docs/plantillas/` |

## Estructura

```
├── *.html                  Páginas. El contenido dinámico se escribe aquí
├── blog/                   Una página por artículo (generada)
├── parciales/              Cabecera, pie, head y plantilla de artículo
├── data/                   Contenido sincronizado desde Google (generado)
├── assets/
│   ├── css/tokens.css      Colores, tipografías y espaciado de la marca
│   ├── css/main.css        Todo el diseño
│   ├── js/config.js        ← el único fichero que hay que configurar
│   ├── js/lib/             Librerías compartidas entre navegador y Node
│   └── img/fotos/          Fotografías
├── scripts/                Sincronización, comprobación y servidor
└── docs/                   Documentación
```

## Documentación

| Documento | Para quién |
|---|---|
| [Manual de Sara](docs/MANUAL-SARA.md) | Para Sara. Cómo publicar catas y artículos |
| [Operativa de contenidos](docs/OPERATIVA-CONTENIDOS.md) | Montaje de Google Sheets y Docs, publicación, alojamiento |
| [Propuesta de diseño](docs/PROPUESTA-DISENO.md) | Decisiones de marca, arquitectura y accesibilidad |

## Cómo llega el contenido a la web

```
Google Sheets (catas · blog)  ─┐
Google Docs (artículos)       ─┴─► sync.mjs ─► data/*.json + HTML ─► publicado
```

La sincronización se ejecuta cada hora desde GitHub Actions, y a mano cuando
hace falta. Deja el contenido **escrito dentro del HTML**, así que la web no
depende de Google en tiempo de ejecución y funciona sin JavaScript.

## Configuración

Todo en `assets/js/config.js`: enlaces de las hojas publicadas, correo,
dominio y modo del formulario de contacto. Está comentado paso a paso.

## Antes de publicar

- [ ] Datos fiscales en `aviso-legal.html` y `privacidad.html`
- [ ] Correo y dominio reales en `config.js`
- [ ] Enlaces de las hojas de Google en `config.js`
- [ ] Sustituir las catas y artículos de ejemplo
- [ ] `node scripts/comprobar.mjs` sin errores
