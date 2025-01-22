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

let currentPage = 1;
const productsPerPage = 15;
let totalProducts = 0;
let allProducts = []; // Armazena todos os produtos recebidos

// Função para obter os produtos e lidar com a pesquisa
const getRowsProducts = () => {
  // Ouve o evento de submit no formulário de pesquisa
  document
    .getElementById("searchForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault(); // Previne o comportamento padrão do formulário

      // Obtém os valores dos campos de pesquisa
      const nomepesquisa = document.querySelector(
        'input[name="nomepesquisa"]'
      ).value; // Nome do produto

      // Monta a URL com os parâmetros de pesquisa
      const url = `http://localhost:3333/estoque?nomepesquisa=${nomepesquisa}`;

      // Exibe um indicador de carregamento enquanto aguarda a resposta da API
      const carregando = document.createElement("span");
      carregando.classList.add("carregando");
      document.querySelector("body").appendChild(carregando);

      // Realiza a requisição fetch para buscar os produtos
      const responseFetch = await fetch(url);
      const responseJson = await responseFetch.json();
      carregando.classList.remove("carregando"); // Remove o indicador de carregamento

      // Atualiza a lista de todos os produtos e o total de produtos encontrados
      allProducts = responseJson;
      totalProducts = allProducts.length; // Atualiza o total de produtos
      currentPage = 1; // Reseta para a primeira página

      // Filtra os produtos com base nos valores passados no formulário
      const filteredProducts = allProducts.filter((item) => {
        const matchesNome = nomepesquisa
          ? item.nomedoproduto
              .toLowerCase()
              .includes(nomepesquisa.toLowerCase())
          : true;
        return matchesNome;
      });

      // Atualiza a exibição dos produtos filtrados
      totalProducts = filteredProducts.length; // Atualiza o total de produtos filtrados
      allProducts = filteredProducts; // Atualiza a lista de produtos com os filtrados
      updateProductsDisplay(); // Atualiza a exibição dos produtos
    });
};

// Função para atualizar a exibição dos produtos na tabela
const updateProductsDisplay = () => {
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = Math.min(startIndex + productsPerPage, totalProducts);
  const produtosFiltrados = allProducts.slice(startIndex, endIndex);

  createRowProducts(produtosFiltrados); // Cria as linhas da tabela com os produtos
  updatePaginationButtons(); // Atualiza os botões de paginação

  // Exibe ou oculta a barra de navegação de páginas dependendo do número de produtos encontrados
  const paginationDiv = document.querySelector(".pagination");
  paginationDiv.style.display = produtosFiltrados.length > 0 ? "flex" : "none";

  // Fixar o footer se menos de 15 produtos forem encontrados
  const footer = document.querySelector("footer");
  if (produtosFiltrados.length < 6) {
    footer.style.position = "fixed";
    footer.style.bottom = "0";
    footer.style.width = "100%";
  } else {
    footer.style.position = "relative";
  }
};

// Função para atualizar os botões de navegação de páginas
const updatePaginationButtons = () => {
  const prevButton = document.getElementById("prevBtn");
  const nextButton = document.getElementById("nextBtn");

  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage * productsPerPage >= totalProducts;

  prevButton.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      updateProductsDisplay();
    }
  };

  nextButton.onclick = () => {
    if (currentPage * productsPerPage < totalProducts) {
      currentPage++;
      updateProductsDisplay();
    }
  };
};

// Função para criar as linhas da tabela com os produtos
const createRowProducts = (produtosFiltrados) => {
  let tHead = document.querySelector("thead");
  let tbody = document.querySelector("tbody");
  let footer = document.querySelector("footer");
  tbody.innerHTML = ""; // Limpa a tabela antes de renderizar

  if (!tHead.hasChildNodes()) {
    const createTrHead = document.createElement("tr");
    createTrHead.innerHTML = `
      <th>COD</th>
      <th>NOME</th>
      <th>UNIDADE DE MEDIDA</th>
      <th>QUANTIDADE</th>
      <th>CATEGORIA</th>
      <th>VALOR DE VENDA</th>
      `;
    tHead.appendChild(createTrHead); // Adiciona o cabeçalho ao thead
  }

  footer.style.position = "relative";

  produtosFiltrados.forEach((item) => {
    const createTr = document.createElement("tr");
    createTr.innerHTML = `
        <td>${item.id}</td>
        <td>${item.nomedoproduto}</td>
        <td>${item.unidadedereferencia}</td>
        <td>${item.quantidadedoproduto}</td>
        <td>${item.categoria}</td>
        <td>${new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(item.valordevenda)}</td>
        `;

    tbody.appendChild(createTr);
  });
};

// Função chamada para inicializar a pesquisa
getRowsProducts();
