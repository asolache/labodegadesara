/**
 * Formulario de contacto.
 *
 * Funciona de tres maneras según CONFIG.formulario.modo:
 *   'mailto'    → abre el correo del visitante con el mensaje ya escrito.
 *                 No necesita ningún servicio, pero depende de que tenga
 *                 configurado un cliente de correo.
 *   'formspree' → envía a Formspree y Sara recibe un email. Recomendado.
 *   'netlify'   → usa los formularios de Netlify (requiere los atributos
 *                 netlify en el <form>, ver docs/OPERATIVA-CONTENIDOS.md).
 *
 * En los tres casos se valida antes y se descarta el envío si ha caído un
 * robot en el campo trampa.
 */

import { CONFIG, email } from './config.js';

const formulario = document.querySelector('[data-formulario]');

if (formulario) {
  const avisoOk = document.querySelector('[data-aviso="ok"]');
  const avisoError = document.querySelector('[data-aviso="error"]');
  const boton = formulario.querySelector('[type="submit"]');

  /* --- Prerrelleno del motivo según de dónde venga -----------------------
     Los botones de las páginas de servicio enlazan con ?motivo=restaurante,
     ?motivo=bodega, etc. Así el visitante se ahorra un paso.              */
  const motivo = new URLSearchParams(location.search).get('motivo');
  const selectMotivo = formulario.querySelector('#motivo');

  if (motivo && selectMotivo) {
    const opcion = [...selectMotivo.options].find(o => o.value === motivo);
    if (opcion) selectMotivo.value = motivo;
  }

  /* --- Validación ---------------------------------------------------------
     Se hace a mano para poder enseñar mensajes en castellano y en el tono de
     la casa, en lugar de los del navegador.                                */
  const mensajes = {
    nombre: 'Dime cómo te llamas, aunque sea sólo el nombre.',
    correo: 'Necesito un correo válido para poder contestarte.',
    mensaje: 'Cuéntame algo, aunque sean dos líneas.',
    privacidad: 'Necesito que aceptes la política de privacidad.'
  };

  function validar() {
    let primerFallo = null;

    for (const campo of formulario.elements) {
      if (!campo.name || campo.name === 'web') continue;

      const contenedor = campo.closest('.campo');
      contenedor?.querySelector('.error-campo')?.remove();
      campo.removeAttribute('aria-invalid');

      const vacio = campo.type === 'checkbox' ? !campo.checked : !campo.value.trim();
      const correoMal = campo.type === 'email' &&
                        campo.value.trim() &&
                        !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(campo.value.trim());

      if ((campo.required && vacio) || correoMal) {
        campo.setAttribute('aria-invalid', 'true');

        const aviso = document.createElement('p');
        aviso.className = 'error-campo';
        aviso.textContent = mensajes[campo.name] ?? 'Revisa este campo, por favor.';
        aviso.style.cssText = 'color: var(--c-alerta); font-size: var(--t-xs); margin: 0';
        contenedor?.appendChild(aviso);

        if (!primerFallo) primerFallo = campo;
      }
    }

    if (primerFallo) {
      primerFallo.focus();
      primerFallo.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return false;
    }

    return true;
  }

  /* --- Envío -------------------------------------------------------------- */

  function mostrar(aviso) {
    avisoOk.hidden = true;
    avisoError.hidden = true;
    if (aviso) {
      aviso.hidden = false;
      aviso.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  function textoDelMensaje(datos) {
    const motivos = {
      cata: 'Apuntarme a una cata',
      privada: 'Cata privada o evento',
      empresa: 'Cata para empresa',
      restaurante: 'Restaurante',
      bodega: 'Bodega',
      otro: 'Otra cosa'
    };

    return [
      `Nombre: ${datos.nombre}`,
      `Correo: ${datos.correo}`,
      `Motivo: ${motivos[datos.motivo] ?? datos.motivo}`,
      '',
      datos.mensaje
    ].join('\n');
  }

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    if (!validar()) return;

    const datos = Object.fromEntries(new FormData(formulario));

    // Campo trampa relleno: es un robot. Se finge éxito y no se envía nada.
    if (datos.web) { mostrar(avisoOk); formulario.reset(); return; }

    const { modo, endpoint } = CONFIG.formulario;
    const asunto = `Web · ${datos.motivo} · ${datos.nombre}`;

    if (modo === 'mailto' || (modo === 'formspree' && !endpoint)) {
      location.href = `mailto:${email()}` +
        `?subject=${encodeURIComponent(asunto)}` +
        `&body=${encodeURIComponent(textoDelMensaje(datos))}`;
      mostrar(avisoOk);
      return;
    }

    boton.disabled = true;
    const textoOriginal = boton.textContent;
    boton.textContent = 'Enviando…';

    try {
      const destino = modo === 'netlify' ? '/' : endpoint;
      const cuerpo = modo === 'netlify'
        ? new URLSearchParams({ 'form-name': 'contacto', ...datos })
        : JSON.stringify({ ...datos, _subject: asunto });

      const respuesta = await fetch(destino, {
        method: 'POST',
        headers: modo === 'netlify'
          ? { 'Content-Type': 'application/x-www-form-urlencoded' }
          : { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: cuerpo
      });

      if (!respuesta.ok) throw new Error(`Respuesta ${respuesta.status}`);

      mostrar(avisoOk);
      formulario.reset();
    } catch {
      mostrar(avisoError);
    } finally {
      boton.disabled = false;
      boton.textContent = textoOriginal;
    }
  });
}
