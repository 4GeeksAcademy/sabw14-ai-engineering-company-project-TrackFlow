// Menú de navegación móvil: abre/cierra y sincroniza aria-expanded.
(function () {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu-principal');
  if (!toggle || !menu) return;

  function setOpen(open) {
    menu.classList.toggle('hidden', !open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
  }

  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Cerrar al elegir un enlace (móvil) o con Escape.
  menu.addEventListener('click', function (event) {
    if (event.target.closest('a') && window.matchMedia('(max-width: 767px)').matches) setOpen(false);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
})();
