/**
 * Pinta las catas donde se le indique.
 *
 * Los contenedores se marcan en el HTML así:
 *   <div data-catas="proximas" data-limite="3"></div>
 *   <div data-catas="pasadas"></div>
 *
 * El sincronizador ya deja el HTML escrito dentro de esos contenedores, de
 * modo que la página se ve completa antes de que corra nada de JavaScript.
 * Este módulo sólo vuelve a pintar si el Google Sheet trae algo distinto.
 */

import { cargarCatas } from './datos.js';
import { catalHTML, vacioHTML } from './lib/plantillas.js';

const contenedores = document.querySelectorAll('[data-catas]');

if (contenedores.length) {
  cargarCatas(({ futuras, pasadas }) => {
    contenedores.forEach(caja => {
      const tipo = caja.dataset.catas;
      const limite = Number(caja.dataset.limite) || 0;

      let lista = tipo === 'pasadas' ? pasadas : futuras;
      if (limite > 0) lista = lista.slice(0, limite);

      if (!lista.length) {
        // En la home, si no hay catas abiertas, la sección entera sobra.
        if (caja.dataset.ocultarSiVacio === 'true') {
          caja.closest('[data-seccion-catas]')?.remove();
          return;
        }

        caja.innerHTML = tipo === 'pasadas'
          ? ''
          : vacioHTML(
              'Ahora mismo no hay catas con fecha',
              'Estoy preparando las próximas. Escríbeme y te aviso en cuanto abra plazas.',
              '<a class="boton boton--principal" href="/contacto.html">Avísame</a>'
            );
        return;
      }

      caja.innerHTML = lista.map(catalHTML).join('\n');
    });
  });
}
