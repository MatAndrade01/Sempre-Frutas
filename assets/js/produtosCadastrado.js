
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

document.addEventListener('DOMContentLoaded', function() {
    const buttonsGear = document.querySelectorAll('.buttonGear'); // Seleciona todos os botões com a classe buttonGear
    const dropLink = document.getElementById('idDropdowLink');

    buttonsGear.forEach(button => {
        button.addEventListener('click', function(event) {
            event.stopPropagation(); // Impede que o evento se propague para o documento
            // Alterna a exibição do dropdown
            if (dropLink.style.display === 'block') {
                dropLink.style.display = 'none'; // Oculta o menu
            } else {
                dropLink.style.display = 'block'; // Mostra o menu
            }
        });
    });

    document.addEventListener('click', function(event) {
        // Fecha o dropdown se o clique for fora dele e dos botões
        if (dropLink.style.display === 'block' && !dropLink.contains(event.target) && !Array.from(buttonsGear).includes(event.target)) {
            dropLink.style.display = 'none'; // Fecha o menu
        }
    });
});

