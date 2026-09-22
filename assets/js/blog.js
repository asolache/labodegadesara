/**
 * Pinta el listado de artículos.
 *
 *   <div data-blog data-limite="3"></div>
 *
 * Igual que en las catas: el HTML ya viene escrito desde la sincronización y
 * esto sólo refresca si hay artículos nuevos.
 */

import { cargarPosts } from './datos.js';
import { postHTML, vacioHTML } from './lib/plantillas.js';

const contenedores = document.querySelectorAll('[data-blog]');

if (contenedores.length) {
  cargarPosts(posts => {
    contenedores.forEach(caja => {
      const limite = Number(caja.dataset.limite) || 0;
      const nivel = Number(caja.dataset.nivel) || 3;
      const lista = limite > 0 ? posts.slice(0, limite) : posts;

      if (!lista.length) {
        if (caja.dataset.ocultarSiVacio === 'true') {
          caja.closest('[data-seccion-blog]')?.remove();
          return;
        }
        caja.innerHTML = vacioHTML(
          'Todavía no hay artículos publicados',
          'Pronto habrá historias de bodegas, botellas y mesas compartidas.'
        );
        return;
      }

      caja.innerHTML = lista.map(p => postHTML(p, { nivel })).join('\n');
    });
  });
}
