/**
 * Validación del formulario de solicitud de información de TrackFlow.
 * Campos, reglas y mensajes tomados literalmente de BRIEFING.md (Hito 1).
 *
 * - Validación en tiempo real: al salir del campo (blur) y, una vez tocado, mientras se escribe.
 * - Al enviar: valida todo, muestra un resumen de errores y lleva el foco al primer campo inválido.
 * - Restricción de negocio: volumen "0-100" con tipo de producto elegido → aviso y confirmación.
 * - Envío simulado: no se conecta a ningún backend todavía.
 */
(function () {
  'use strict';

  const MAX_COMENTARIOS = 500;

  const MENSAJES = {
    nombre_empresa: 'El nombre de la empresa debe tener al menos 2 caracteres',
    persona_contacto: 'Ingresa nombre y apellido del contacto',
    email_corporativo: 'Ingresa un email corporativo válido (ejemplo: nombre@empresa.com)',
    telefono: 'El teléfono debe incluir código de país (ejemplo: +1 213 555 0147)',
    sitio_web: 'Si incluyes sitio web, debe ser una URL válida',
    pais_operacion: 'Selecciona el país de operación principal',
    tipo_producto: 'Selecciona el tipo de producto que manejas',
    volumen_mensual: 'Selecciona el volumen mensual estimado',
    servicios_interes: 'Selecciona al menos un servicio de interés',
    otro_3pl: 'Indica si actualmente trabajas con otro proveedor logístico',
    comentarios: (quedan) => `Los comentarios no pueden exceder 500 caracteres (quedan ${quedan})`,
    acepta_privacidad: 'Debes aceptar la política de privacidad para continuar',
  };

  const ETIQUETAS = {
    nombre_empresa: 'Nombre de la empresa',
    persona_contacto: 'Persona de contacto',
    email_corporativo: 'Email corporativo',
    telefono: 'Teléfono',
    sitio_web: 'Sitio web de la empresa',
    pais_operacion: 'País de operación principal',
    tipo_producto: 'Tipo de producto',
    volumen_mensual: 'Volumen mensual estimado de envíos',
    servicios_interes: 'Servicios de interés',
    otro_3pl: '¿Actualmente trabajas con otro 3PL?',
    comentarios: 'Comentarios o necesidades específicas',
    acepta_privacidad: 'Acepto política de privacidad',
  };

  // Reglas puras: reciben el formulario y devuelven el mensaje de error o '' si es válido.
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const TELEFONO_RE = /^\+\d{1,4}[\s-]?\d(?:[\s-]?\d){5,13}$/;

  const REGLAS = {
    nombre_empresa: (f) => (valor(f, 'nombre_empresa').length >= 2 ? '' : MENSAJES.nombre_empresa),
    persona_contacto: (f) => {
      const palabras = valor(f, 'persona_contacto').split(/\s+/).filter((p) => p.length >= 2);
      return palabras.length >= 2 ? '' : MENSAJES.persona_contacto;
    },
    email_corporativo: (f) => (EMAIL_RE.test(valor(f, 'email_corporativo')) ? '' : MENSAJES.email_corporativo),
    telefono: (f) => (TELEFONO_RE.test(valor(f, 'telefono')) ? '' : MENSAJES.telefono),
    sitio_web: (f) => {
      const v = valor(f, 'sitio_web');
      return v === '' || esUrlValida(v) ? '' : MENSAJES.sitio_web;
    },
    pais_operacion: (f) => (valor(f, 'pais_operacion') ? '' : MENSAJES.pais_operacion),
    tipo_producto: (f) => (valor(f, 'tipo_producto') ? '' : MENSAJES.tipo_producto),
    volumen_mensual: (f) => (valor(f, 'volumen_mensual') ? '' : MENSAJES.volumen_mensual),
    servicios_interes: (f) =>
      f.querySelectorAll('input[name="servicios_interes"]:checked').length > 0 ? '' : MENSAJES.servicios_interes,
    otro_3pl: (f) => (f.querySelector('input[name="otro_3pl"]:checked') ? '' : MENSAJES.otro_3pl),
    comentarios: (f) => {
      const largo = f.elements.comentarios.value.length;
      return largo <= MAX_COMENTARIOS ? '' : MENSAJES.comentarios(Math.max(0, MAX_COMENTARIOS - largo));
    },
    acepta_privacidad: (f) => (f.elements.acepta_privacidad.checked ? '' : MENSAJES.acepta_privacidad),
  };

  function valor(form, nombre) {
    return String(form.elements[nombre].value || '').trim();
  }

  function esUrlValida(texto) {
    if (!/^https?:\/\//i.test(texto)) return false;
    try {
      const url = new URL(texto);
      return /\.[a-z]{2,}$/i.test(url.hostname);
    } catch (e) {
      return false;
    }
  }

  // --- Interfaz -------------------------------------------------------------

  const form = document.getElementById('form-solicitud');
  if (!form) return;

  const resumen = document.getElementById('resumen-errores');
  const listaErrores = document.getElementById('lista-errores');
  const exito = document.getElementById('mensaje-exito');
  const avisoVolumen = document.getElementById('aviso-volumen');
  const contador = document.getElementById('contador-comentarios');
  const dialogo = document.getElementById('dialogo-volumen');
  const tocados = new Set();
  let enviado = false;

  // Elemento que recibe aria-invalid y foco para cada campo.
  function objetivo(nombre) {
    if (nombre === 'servicios_interes' || nombre === 'otro_3pl') {
      return form.querySelector(`input[name="${nombre}"]`);
    }
    return form.elements[nombre];
  }

  function pintar(nombre, mensaje) {
    const error = document.getElementById(`error-${nombre}`);
    const grupo = document.getElementById(`grupo-${nombre}`);
    const campos = nombre === 'servicios_interes' || nombre === 'otro_3pl'
      ? form.querySelectorAll(`input[name="${nombre}"]`)
      : [form.elements[nombre]];

    campos.forEach((c) => {
      if (mensaje) c.setAttribute('aria-invalid', 'true');
      else c.removeAttribute('aria-invalid');
    });
    if (grupo) grupo.classList.toggle('ring-2', Boolean(mensaje));
    if (grupo) grupo.classList.toggle('ring-red-300', Boolean(mensaje));
    if (grupo) grupo.classList.toggle('p-2', Boolean(mensaje));

    error.textContent = mensaje;
    error.classList.toggle('hidden', !mensaje);
  }

  function validarCampo(nombre) {
    const mensaje = REGLAS[nombre](form);
    pintar(nombre, mensaje);
    return mensaje;
  }

  function actualizarContador() {
    const quedan = MAX_COMENTARIOS - form.elements.comentarios.value.length;
    contador.textContent = quedan >= 0
      ? `Quedan ${quedan} caracteres`
      : `Te sobran ${Math.abs(quedan)} caracteres`;
    contador.classList.toggle('text-red-700', quedan < 0);
    contador.classList.toggle('font-semibold', quedan < 0);
  }

  function requiereConfirmacionVolumen() {
    return valor(form, 'volumen_mensual') === '0-100' && valor(form, 'tipo_producto') !== '';
  }

  function actualizarAvisoVolumen() {
    avisoVolumen.classList.toggle('hidden', !requiereConfirmacionVolumen());
  }

  function nombreDeCampo(el) {
    return el && el.name && REGLAS[el.name] ? el.name : null;
  }

  // Validación en tiempo real.
  form.addEventListener('focusout', (e) => {
    const nombre = nombreDeCampo(e.target);
    if (!nombre) return;
    // En grupos (checkbox/radio) solo validar al salir del grupo completo.
    if ((nombre === 'servicios_interes' || nombre === 'otro_3pl') &&
        e.relatedTarget && e.relatedTarget.name === nombre) return;
    tocados.add(nombre);
    validarCampo(nombre);
  });

  form.addEventListener('input', (e) => {
    const nombre = nombreDeCampo(e.target);
    if (!nombre) return;
    if (nombre === 'comentarios') {
      actualizarContador();
      tocados.add(nombre);
    }
    if (tocados.has(nombre)) validarCampo(nombre);
  });

  form.addEventListener('change', (e) => {
    const nombre = nombreDeCampo(e.target);
    if (!nombre) return;
    if (nombre === 'volumen_mensual' || nombre === 'tipo_producto') actualizarAvisoVolumen();
    if (e.target.type === 'checkbox' || e.target.type === 'radio' || e.target.tagName === 'SELECT') {
      tocados.add(nombre);
      validarCampo(nombre);
    }
  });

  // Envío.
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    exito.classList.add('hidden');

    const errores = Object.keys(REGLAS)
      .map((nombre) => ({ nombre, mensaje: validarCampo(nombre) }))
      .filter((r) => r.mensaje);
    Object.keys(REGLAS).forEach((n) => tocados.add(n));

    if (errores.length) {
      mostrarResumen(errores);
      return;
    }
    ocultarResumen();

    if (requiereConfirmacionVolumen()) {
      if (typeof dialogo.showModal === 'function') {
        dialogo.showModal();
        document.getElementById('dialogo-continuar').focus();
        return;
      }
      // Navegadores sin <dialog>: confirmación nativa con el mismo texto.
      if (!window.confirm(avisoVolumen.textContent.trim())) return;
    }
    simularEnvio();
  });

  // Confirmación de volumen bajo: se resuelve en los botones (no depende del evento 'close').
  document.getElementById('dialogo-continuar').addEventListener('click', () => {
    dialogo.close();
    simularEnvio();
  });
  document.getElementById('dialogo-revisar').addEventListener('click', () => {
    dialogo.close();
    form.elements.volumen_mensual.focus();
  });

  form.addEventListener('reset', () => {
    // Esperar a que el navegador restablezca los valores.
    const trasEnvio = enviado;
    enviado = false;
    setTimeout(() => {
      Object.keys(REGLAS).forEach((n) => pintar(n, ''));
      tocados.clear();
      ocultarResumen();
      actualizarContador();
      actualizarAvisoVolumen();
      if (trasEnvio) return; // el mensaje de éxito se queda visible
      exito.classList.add('hidden');
      form.elements.nombre_empresa.focus();
    });
  });

  document.getElementById('nueva-solicitud').addEventListener('click', () => {
    exito.classList.add('hidden');
    form.classList.remove('hidden');
    form.elements.nombre_empresa.focus();
  });

  function mostrarResumen(errores) {
    listaErrores.replaceChildren(
      ...errores.map(({ nombre, mensaje }) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${objetivo(nombre).id || `grupo-${nombre}`}`;
        a.className = 'underline underline-offset-2';
        a.textContent = `${ETIQUETAS[nombre]}: ${mensaje}`;
        a.addEventListener('click', (ev) => {
          ev.preventDefault();
          objetivo(nombre).focus();
        });
        li.appendChild(a);
        return li;
      })
    );
    resumen.classList.remove('hidden');
    objetivo(errores[0].nombre).focus();
  }

  function ocultarResumen() {
    resumen.classList.add('hidden');
    listaErrores.replaceChildren();
  }

  function simularEnvio() {
    // Sin backend todavía (Hito 1): se arma el payload que se enviaría y se muestra el éxito.
    const fd = new FormData(form);
    const solicitud = Object.fromEntries(fd.entries());
    solicitud.servicios_interes = fd.getAll('servicios_interes');
    form.dataset.ultimaSolicitud = JSON.stringify(solicitud);

    enviado = true;
    form.reset();
    form.classList.add('hidden');
    exito.classList.remove('hidden');
    exito.focus();
  }

  actualizarContador();

  // Exponer reglas para pruebas manuales en consola.
  window.TrackFlowValidation = { REGLAS, MENSAJES };
})();
