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

const userLogado = localStorage.getItem('userLogado');
let logado = document.querySelector('.nomeLogado');

logado.innerHTML = `Bem vindo ${userLogado}`;

if(localStorage.getItem('token') == null) { 
    alert('Você não está logado para acessar essa pagina!');
    window.location.href = '/index.html';
}

if(localStorage.getItem('tipodeusuario') == 'caixa') {
    let cadastroDeAlimentosDropdown = document.querySelector('.cadastroDeAlimentosDropDow');
    cadastroDeAlimentosDropdown.style.display = 'none';
    let produtosCadastradosDropdown = document.querySelector('.produtosCadastradosDropDow');
    produtosCadastradosDropdown.style.display = 'none';
    let entradaDeEstoqueDropdown = document.querySelector('.entradaDeEstoqueDropDow');
    entradaDeEstoqueDropdown.style.display = 'none';
    let saidaDeEstoqueDropdown = document.querySelector('.saidaDeEstoqueDropDow');
    saidaDeEstoqueDropdown.style.display = 'none';
    let divRelatorioDropdown = document.querySelector('.divRelatorioDropdowMenu');
    divRelatorioDropdown.style.display = 'none';


    let relatorio = document.querySelector('.divSectionRelatorio');
    relatorio.style.display = 'none';
    let cadastroDeAlimentos = document.querySelector('.cadastroDeAlimentos')
    cadastroDeAlimentos.style.display = 'none';
    let produtosCadastrados = document.querySelector('.produtosCadastrados')
    produtosCadastrados.style.display = 'none';
    let entradaDeEstoque = document.querySelector('.entrada')
    entradaDeEstoque.style.display = 'none';
    let saidaDeEstoque = document.querySelector('.saida')
    saidaDeEstoque.style.display = 'none';
}

function sair() {
    window.location.href = '/index.html';
    localStorage.removeItem('token');
    localStorage.removeItem('userLogado');
    localStorage.removeItem('tipodeusuario');
}