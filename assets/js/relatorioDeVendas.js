document.addEventListener('DOMContentLoaded', async function () {
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
              alert('Você não acesso a essa pagina!');
              window.location.href = './home.html';
          }
      } 
  }catch (error) {
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

document.addEventListener("DOMContentLoaded", function () {
  const filtrosSelect = document.querySelector("#filtros");
  const nomeInput = document.querySelector("#nomepesquisa");
  const periodoInicialInput = document.querySelector("#datainicial");
  const periodoFinalInput = document.querySelector("#datafinal");
  const tipoDeMovimentacaoSelect = document.querySelector(
    "#tipo-de-movimentacao"
  );
  const tipoDeVendaSelect = document.querySelector("#tipo-de-venda");
  const formaDePagamento = document.querySelector("#forma-de-pagamento");

  // Função para formatar a data como 'YYYY-MM-DD'
  // Função para formatar a data como 'YYYY-MM-DD' no horário local
  function formatDate(date) {
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    return localDate.toISOString().split("T")[0];
  }

  // Função para exibir/ocultar campos com base no filtro selecionado
  function toggleFields() {
    const tipoDeFiltro = filtrosSelect.value;

    // Esconde todos os campos primeiro
    nomeInput.closest(".single-input").style.display = "none";
    periodoInicialInput.closest(".single-input").style.display = "none";
    periodoFinalInput.closest(".single-input").style.display = "none";
    tipoDeMovimentacaoSelect.closest(".single-input").style.display = "none";
    tipoDeVendaSelect.closest(".single-input").style.display = "none";
    formaDePagamento.closest(".single-input").style.display = "none";

    // Exibe campos conforme o filtro selecionado
    if (tipoDeFiltro === "nome") {
      nomeInput.closest(".single-input").style.display = "block";
      document.querySelector("#datainicial").value = "";
      document.querySelector("#datafinal").value = "";
      document.querySelector("#tipo-de-movimentacao").value = "";
      document.querySelector("#tipo-de-venda").value = "";
      document.querySelector("#forma-de-pagamento").value = "";
    } else if (tipoDeFiltro === "nomeeperiodoeformadepagamento") {
      nomeInput.closest(".single-input").style.display = "block";
      formaDePagamento.closest(".single-input").style.display = "block";
      document.querySelector("#forma-de-pagamento").value = "DINHEIRO";
      document.querySelector("#tipo-de-movimentacao").value = "";
      document.querySelector("#tipo-de-venda").value = "";
      periodoInicialInput.closest(".single-input").style.display = "block";
      periodoFinalInput.closest(".single-input").style.display = "block";
      document.getElementById("datainicial").value = formatDate(new Date());
      document.getElementById("datafinal").value = formatDate(new Date());
    } else if (tipoDeFiltro === "nomeetipodemovimentacaoeperiodo") {
      nomeInput.closest(".single-input").style.display = "block";
      tipoDeMovimentacaoSelect.closest(".single-input").style.display = "block";
      document.querySelector("#tipo-de-movimentacao").value = "VENDA";
      periodoInicialInput.closest(".single-input").style.display = "block";
      periodoFinalInput.closest(".single-input").style.display = "block";
      document.getElementById("datainicial").value = formatDate(new Date());
      document.getElementById("datafinal").value = formatDate(new Date());
    } else if (tipoDeFiltro === "nomeeperiodo") {
      nomeInput.closest(".single-input").style.display = "block";
      periodoInicialInput.closest(".single-input").style.display = "block";
      periodoFinalInput.closest(".single-input").style.display = "block";
      // Preenche os campos de data com a data atual
      document.getElementById("datainicial").value = formatDate(new Date());
      document.getElementById("datafinal").value = formatDate(new Date());
      document.querySelector("#forma-de-pagamento").value = "";
    } else if (tipoDeFiltro === "periodoetipodemovimentacao") {
      periodoInicialInput.closest(".single-input").style.display = "block";
      periodoFinalInput.closest(".single-input").style.display = "block";
      tipoDeMovimentacaoSelect.closest(".single-input").style.display = "block";
      // Preenche os campos de data com a data atual
      document.getElementById("datainicial").value = formatDate(new Date());
      document.getElementById("datafinal").value = formatDate(new Date());
      document.querySelector("#tipo-de-movimentacao").value = "VENDA";
      document.querySelector("#nomepesquisa").value = "";
    } else if (tipoDeFiltro === "periodoetipodevenda") {
      periodoInicialInput.closest(".single-input").style.display = "block";
      periodoFinalInput.closest(".single-input").style.display = "block";
      tipoDeVendaSelect.closest(".single-input").style.display = "block";
      document.querySelector("#tipo-de-venda").value = "LOJA";
      document.querySelector("#tipo-de-movimentacao").value = "";
      document.querySelector("#nomepesquisa").value = "";
      // Preenche os campos de data com a data atual
      document.getElementById("datainicial").value = formatDate(new Date());
      document.getElementById("datafinal").value = formatDate(new Date());
    }
  }

  // Chama a função ao carregar a página e quando o filtro é alterado
  filtrosSelect.addEventListener("change", toggleFields);

  // Chama a função quando a página for carregada para aplicar o filtro inicial
  toggleFields();

  const button = document.getElementById("idButtonBuguer");
  const menu = document.getElementById("idDropDowMenu");

  button.addEventListener("click", function () {
    menu.classList.toggle("show"); // Alterna a exibição do menu
  });

  const buttonsGear = document.querySelectorAll(".buttonGear");
  let dropLink = document.getElementById("idDropdowLink");

  buttonsGear.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      dropLink.style.display =
        dropLink.style.display === "block" ? "none" : "block";
    });
  });

  document.addEventListener("click", function (event) {
    if (
      dropLink.style.display === "block" &&
      !dropLink.contains(event.target) &&
      !Array.from(buttonsGear).includes(event.target)
    ) {
      dropLink.style.display = "none";
    }
  });

  // Função para capitalizar as strings
function capitalize(text) {
  if (!text) return text;
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
        const nomepesquisa = document.querySelector("#nomepesquisa").value; // Nome do produto
        const datainicial = document.querySelector("#datainicial").value; // Data inicial
        const datafinal = document.querySelector("#datafinal").value; // Data final
        const tipodemovimentacao = document.querySelector(
          "#tipo-de-movimentacao"
        ).value;
        const tipodevenda = document.querySelector("#tipo-de-venda").value;
        const formadepagamento = document.querySelector(
          "#forma-de-pagamento"
        ).value;
        // Monta a URL com os parâmetros de pesquisa
        const url = `http://localhost:3333/relatorio?nomepesquisa=${nomepesquisa}&datainicial=${datainicial}&datafinal=${datafinal}&tipodemovimentacao=${tipodemovimentacao}&tipodevenda=${tipodevenda}&formadepagamento=${formadepagamento}`;

        // Exibe um indicador de carregamento enquanto aguarda a resposta da API
        const carregando = document.createElement("span");
        carregando.classList.add("carregando");
        document.querySelector("body").appendChild(carregando);

        // Realiza a requisição fetch para buscar os produtos
        const responseFetch = await fetch(url);
        const responseJson = await responseFetch.json();
        carregando.classList.remove("carregando"); // Remove o indicador de carregamento

        // Atualiza allProducts com os dados recebidos da API
        allProducts = responseJson;

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
    paginationDiv.style.display =
      produtosFiltrados.length > 0 ? "flex" : "none";

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

    // Verifica se há produtos para exibir
    if (produtosFiltrados.length > 0) {
      // Se o cabeçalho não existir, cria-o
      if (!tHead.hasChildNodes()) {
        const createTrHead = document.createElement("tr");
        createTrHead.innerHTML = `
          <th>Cod</th>
          <th>Nome</th>
          <th>Quantidade</th>
          <th>Valor Da Movimentação</th>
          <th>Forma De Pagamento</th>
          <th>Tipo De Movimentação</th>
          <th>Tipo De Compra</th>
          <th>Data</th>
        `;
        tHead.appendChild(createTrHead); // Adiciona o cabeçalho ao thead
      }

      // Preenche o tbody com as linhas dos produtos filtrados
      produtosFiltrados.forEach((item) => {

        const nomeProduto = capitalize(item.nomedoproduto.trim()); // Capitaliza o nome do produto
        const formaPagamento = capitalize(item.formadepagamento); // Capitaliza forma de pagamento
        const tipoMovimento = capitalize(item.tipodemovimento); // Capitaliza tipo de movimentação
        const tipoCompra = capitalize(item.tipodecompra); // Capitaliza tipo de compra
        const createTr = document.createElement("tr");
        createTr.innerHTML = `
          <td>${item.id}</td>
          <td>${nomeProduto}</td>
          <td>${item.quantidade}</td>
          <td>R$ ${parseFloat(item.valor).toFixed(2).replace(".", ",")}</td>
          <td>${formaPagamento}</td>
          <td>${tipoMovimento}</td>
          <td>${tipoCompra}</td>
          <td>${new Date(item.data).toLocaleDateString("pt-BR")}</td>
        `;
        tbody.appendChild(createTr);
      });
    } else {
      // Se não houver produtos, esconde o cabeçalho
      tHead.innerHTML = "";
    }

    footer.style.position = "relative";
  };

  // Função chamada para inicializar a pesquisa
  getRowsProducts();
});
