/**
 * Comportamiento común a todas las páginas:
 * menú, sombra de la cabecera al bajar, aparición suave de secciones,
 * año del pie y correo protegido de los robots de spam.
 */

import { CONFIG, email } from './config.js';

/* ---- Menú de móvil ------------------------------------------------------- */

function menu() {
  const nav = document.querySelector('[data-nav]');
  const boton = document.querySelector('[data-nav-boton]');
  if (!nav || !boton) return;

  const abrir = (abierto) => {
    nav.dataset.abierto = String(abierto);
    boton.setAttribute('aria-expanded', String(abierto));
    document.body.style.overflow = abierto ? 'hidden' : '';
  };

  boton.addEventListener('click', () => {
    abrir(nav.dataset.abierto !== 'true');
  });

  // Al elegir una sección, el menú se cierra solo.
  nav.querySelectorAll('a').forEach(enlace => {
    enlace.addEventListener('click', () => abrir(false));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.dataset.abierto === 'true') {
      abrir(false);
      boton.focus();
    }
  });

  // Si la ventana se ensancha hasta el diseño de escritorio, se restablece.
  const ancho = window.matchMedia('(min-width: 60.0625rem)');
  ancho.addEventListener('change', e => { if (e.matches) abrir(false); });
}

/* ---- Cabecera: filete y sombra al desplazarse ---------------------------- */

function cabecera() {
  const cabecera = document.querySelector('[data-cabecera]');
  if (!cabecera) return;

  const pintar = () => {
    cabecera.dataset.desplazada = String(window.scrollY > 12);
  };

  pintar();
  window.addEventListener('scroll', pintar, { passive: true });
}

/* ---- Aparición suave ----------------------------------------------------- */

function animaciones() {
  const elementos = document.querySelectorAll('[data-animar]');
  if (!elementos.length) return;

  // Sin soporte o con movimiento reducido: se muestran sin más.
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducido || !('IntersectionObserver' in window)) {
    elementos.forEach(el => el.classList.add('visible'));
    return;
  }

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add('visible');
      observador.unobserve(entrada.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  elementos.forEach(el => observador.observe(el));
}

/* ---- Datos de contacto --------------------------------------------------- */

/**
 * Rellena los enlaces de correo en el momento de cargar la página.
 * Al no estar la dirección escrita en el HTML, los rastreadores de spam
 * tienen más difícil recogerla.
 */
function contacto() {
  const direccion = email();

  document.querySelectorAll('[data-email]').forEach(el => {
    const asunto = el.dataset.asunto || '';
    el.setAttribute('href',
      `mailto:${direccion}${asunto ? `?subject=${encodeURIComponent(asunto)}` : ''}`);
    if (el.dataset.email === 'texto' || !el.textContent.trim()) {
      el.textContent = direccion;
    }
  });

  document.querySelectorAll('[data-telefono]').forEach(el => {
    if (!CONFIG.telefono) { el.closest('[data-si-telefono]')?.remove(); return; }
    el.setAttribute('href', `tel:${CONFIG.telefono}`);
    if (!el.textContent.trim()) el.textContent = CONFIG.telefono;
  });

  document.querySelectorAll('[data-instagram]').forEach(el => {
    el.setAttribute('href', CONFIG.instagram);
  });
}

/* ---- Año en el pie ------------------------------------------------------- */

function anio() {
  document.querySelectorAll('[data-anio]').forEach(el => {
    el.textContent = String(new Date().getFullYear());
  });
}

/* ---- Página actual en el menú -------------------------------------------- */

function marcarPaginaActual() {
  const aqui = location.pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';

  document.querySelectorAll('.nav__enlace').forEach(enlace => {
    const destino = new URL(enlace.getAttribute('href'), location.href)
      .pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';

    // El blog marca también sus artículos, que cuelgan de /blog/.
    const coincide = destino === aqui ||
      (destino.endsWith('/blog') && aqui.startsWith('/blog'));

    if (coincide) enlace.setAttribute('aria-current', 'page');
  });
}

/* ---- Arranque ------------------------------------------------------------ */

menu();
cabecera();
animaciones();
contacto();
anio();
marcarPaginaActual();
