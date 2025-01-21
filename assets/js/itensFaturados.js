document.addEventListener('DOMContentLoaded', async function () {
  const button = document.getElementById('idButtonBuguer');
  const menu = document.getElementById('idDropDowMenu');

  // Lógica para abrir/fechar o menu dropdown
  button.addEventListener('click', function () {
    if (menu.classList.contains('show')) {
      menu.classList.remove('show'); // Oculta o menu
    } else {
      menu.classList.add('show'); // Mostra o menu
    }
  });

  // Obtendo o login do usuário
  const userLogado = localStorage.getItem('userLogado');
  let logado = document.querySelector('.nomeLogado');

  if (!userLogado) {
    alert('Login do usuário não encontrado!');
    window.location.href = '/index.html';
    return;
  }

  logado.innerHTML = `Bem vindo ${userLogado}`;

  // Verifica se o token existe (usuário está logado)
  if (localStorage.getItem('token') == null) {
    alert('Você não está logado para acessar essa página!');
    window.location.href = '/index.html';
    return;
  }

  try {
    // Fazendo a requisição ao backend para buscar o tipo de usuário
    const response = await fetch(`http://localhost:3333/tipodeusuario?login=${encodeURIComponent(userLogado)}`);
    const data = await response.json();

    if (response.ok) {
      const { tipodeusuario } = data;

      // Se o tipo de usuário for 'caixa', esconde os elementos
      if (tipodeusuario === 'caixa') {
        const dropdownClasses = [
          '.cadastroDeAlimentosDropDow',
          '.produtosCadastradosDropDow',
          '.entradaDeEstoqueDropDow',
          '.saidaDeEstoqueDropDow',
          '.divRelatorioDropdowMenu',
        ];
        const sections = [
          '.divSectionRelatorio',
          '.cadastroDeAlimentos',
          '.produtosCadastrados',
          '.entrada',
          '.saida',
        ];

        [...dropdownClasses, ...sections].forEach((selector) => {
          const element = document.querySelector(selector);
          if (element) {
            element.style.display = 'none';
          }
        });
      }
    } else {
      alert(data.error || 'Erro ao buscar o tipo de usuário');
      window.location.href = '/index.html';
    }
  } catch (error) {
    console.error('Erro ao fazer a requisição:', error);
    alert('Erro ao conectar com o servidor');
    
  }
});

function sair() {
  window.location.href = "/index.html";
  localStorage.removeItem("token");
  localStorage.removeItem("userLogado");
  localStorage.removeItem("tipodeusuario");
}
