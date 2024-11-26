document.addEventListener('DOMContentLoaded', function() {
  // Função para formatar a data como 'YYYY-MM-DD'
  function formatDate(date) {
    return date.toISOString().split('T')[0]; // Retorna no formato 'YYYY-MM-DD'
  }

  // Preenche os campos de data com a data atual
  document.getElementById('datainicial').value = formatDate(new Date());
  document.getElementById('datafinal').value = formatDate(new Date());

  const button = document.getElementById('idButtonBuguer');
  const menu = document.getElementById('idDropDowMenu');

  button.addEventListener('click', function() {
    menu.classList.toggle('show'); // Alterna a exibição do menu
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const buttonsGear = document.querySelectorAll('.buttonGear');
  let dropLink = document.getElementById('idDropdowLink');

  buttonsGear.forEach(button => {
    button.addEventListener('click', function(event) {
      event.stopPropagation();
      dropLink.style.display = dropLink.style.display === 'block' ? 'none' : 'block';
    });
  });

  document.addEventListener('click', function(event) {
    if (dropLink.style.display === 'block' && !dropLink.contains(event.target) && !Array.from(buttonsGear).includes(event.target)) {
      dropLink.style.display = 'none';
    }
  });
});

let currentPage = 1;
const productsPerPage = 15;
let totalProducts = 0;
let allProducts = []; // Armazena todos os produtos recebidos

// Função para obter os produtos e lidar com a pesquisa
const getRowsProducts = () => {
  // Ouve o evento de submit no formulário de pesquisa
  document.getElementById('searchForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Previne o comportamento padrão do formulário

    // Obtém os valores dos campos de pesquisa
    const nomepesquisa = document.querySelector('input[name="nomepesquisa"]').value; // Nome do produto
    const datainicial = document.querySelector('input[name="datainicial"]').value; // Data inicial
    const datafinal = document.querySelector('input[name="datafinal"]').value; // Data final

    // Monta a URL com os parâmetros de pesquisa
    const url = `http://localhost:3333/relatorio?nomepesquisa=${nomepesquisa}&datainicial=${datainicial}&datafinal=${datafinal}`;

    // Exibe um indicador de carregamento enquanto aguarda a resposta da API
    const carregando = document.createElement('span');
    carregando.classList.add('carregando');
    document.querySelector('body').appendChild(carregando);

    // Realiza a requisição fetch para buscar os produtos
    const responseFetch = await fetch(url);
    const responseJson = await responseFetch.json();
    carregando.classList.remove('carregando'); // Remove o indicador de carregamento

    // Atualiza a lista de todos os produtos e o total de produtos encontrados
    allProducts = responseJson;  
    totalProducts = allProducts.length; // Atualiza o total de produtos
    currentPage = 1; // Reseta para a primeira página

    // Filtra os produtos com base nos valores passados no formulário
    const filteredProducts = allProducts.filter(item => {
      const matchesNome = nomepesquisa ? item.nome.toLowerCase().includes(nomepesquisa.toLowerCase()) : true;
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
  const paginationDiv = document.querySelector('.pagination');
  paginationDiv.style.display = produtosFiltrados.length > 0 ? 'flex' : 'none';
};

// Função para atualizar os botões de navegação de páginas
const updatePaginationButtons = () => {
  const prevButton = document.getElementById('prevBtn');
  const nextButton = document.getElementById('nextBtn');

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
  let tHead = document.querySelector('thead');
  let tbody = document.querySelector('tbody');
  let footer = document.querySelector('footer');
  tbody.innerHTML = ''; // Limpa a tabela antes de renderizar

  tHead.style.opacity = '1';
  footer.style.position = 'relative';

  produtosFiltrados.forEach(item => {
    const createTr = document.createElement('tr');
    createTr.innerHTML = `
      <td>${item.id}</td>
      <td>${item.nomedoproduto}</td>
      <td>R$ ${parseFloat(item.valor).toFixed(2).replace('.', ',')}</td>
      <td>${item.tipodemovimento}</td>
      <td>${item.quantidade}</td>
      <td>${new Date(item.data).toLocaleDateString('pt-BR')}</td>
      `;

    tbody.appendChild(createTr);
  });
};

// Função chamada para inicializar a pesquisa
getRowsProducts();
