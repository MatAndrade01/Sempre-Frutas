document.addEventListener('DOMContentLoaded', function() {
  const button = document.getElementById('idButtonBuguer');
  const menu = document.getElementById('idDropDowMenu');

  button.addEventListener('click', function() {
      // Verifica se o menu está visível
      if (menu.classList.contains('show')) {
          menu.classList.remove('show'); // Oculta o menu
      } else {
          menu.classList.add('show'); // Mostra o menu
      }
  });
});