document.addEventListener("DOMContentLoaded", async function () {
  // Menu do botão burger
  const button = document.getElementById("idButtonBuguer");
  const menu = document.getElementById("idDropDowMenu");
  button.addEventListener("click", function () {
    menu.classList.toggle("show");
  });

  // Dropdown de opções com botão de engrenagem
  const buttonsGear = document.querySelectorAll(".buttonGear");
  const dropLinks = document.querySelectorAll(".optionsMenu");

  buttonsGear.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      const dropLink = button.nextElementSibling;
      toggleDropdown(dropLink);
    });
  });

  // Obtendo o login do usuário
  const userLogado = localStorage.getItem("userLogado");
  let logado = document.querySelector(".nomeLogado");

  if (!userLogado) {
    alert("Login do usuário não encontrado!");
    window.location.href = "/index.html";
    return;
  }

  logado.innerHTML = `Bem vindo ${userLogado}`;

  // Verifica se o token existe (usuário está logado)
  if (localStorage.getItem("token") == null) {
    alert("Você não está logado para acessar essa página!");
    window.location.href = "/index.html";
    return;
  }

  try {
    // Fazendo a requisição ao backend para buscar o tipo de usuário
    const response = await fetch(
      `http://localhost:3333/tipodeusuario?login=${encodeURIComponent(
        userLogado
      )}`
    );
    const data = await response.json();

    if (response.ok) {
      const { tipodeusuario } = data;
      // Se o tipo de usuário for 'caixa', esconde os elementos
      if (tipodeusuario === "caixa") {
        alert("Você não acesso a essa pagina!");
        window.location.href = "./home.html";
      }
    }
  } catch (error) {
    console.error("Erro ao fazer a requisição:", error);
    alert("Erro ao conectar com o servidor");
  }

  document.addEventListener("click", function (event) {
    dropLinks.forEach((dropLink) => {
      if (
        dropLink.style.display === "block" &&
        !dropLink.contains(event.target)
      ) {
        dropLink.style.display = "none";
      }
    });
  });
});

// Função para alternar a exibição do dropdown
function toggleDropdown(dropdown) {
  dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
}

// Paginação e pesquisa de produtos
let currentPage = 1;
const productsPerPage = 15;
let allProducts = [];

const getRowsProducts = () => {
  document
    .getElementById("searchForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const nomepesquisa = document.querySelector(
        'input[name="nomepesquisa"]'
      ).value;
      const url = `https://semprefrutasapi.shop/produtosCadastrado?nomepesquisa=${nomepesquisa}`;

      const carregando = document.createElement("span");
      carregando.classList.add("carregando");
      document.querySelector("body").appendChild(carregando);

      const responseFetch = await fetch(url);
      const responseJson = await responseFetch.json();
      carregando.classList.remove("carregando");

      // Filtra os produtos
      allProducts = responseJson.filter((item) =>
        nomepesquisa
          ? item.nome.toLowerCase().includes(nomepesquisa.toLowerCase())
          : true
      );

      currentPage = 1; // Reseta para a primeira página
      updateProductsDisplay();
    });
};

// Atualiza os produtos na tabela
const updateProductsDisplay = () => {
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = Math.min(startIndex + productsPerPage, allProducts.length);
  const produtosFiltrados = allProducts.slice(startIndex, endIndex);

  createRowProducts(produtosFiltrados);
  updatePaginationButtons();

  const paginationDiv = document.querySelector(".pagination");
  paginationDiv.style.display = produtosFiltrados.length > 0 ? "flex" : "none";

  const footer = document.querySelector("footer");
  footer.style.position = produtosFiltrados.length < 6 ? "fixed" : "relative";
  if (produtosFiltrados.length < 6) footer.style.bottom = "0";
};

// Atualiza os botões de navegação
const updatePaginationButtons = () => {
  const prevButton = document.getElementById("prevBtn");
  const nextButton = document.getElementById("nextBtn");

  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage * productsPerPage >= allProducts.length;

  prevButton.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      updateProductsDisplay();
    }
  };

  nextButton.onclick = () => {
    if (currentPage * productsPerPage < allProducts.length) {
      currentPage++;
      updateProductsDisplay();
    }
  };
};

// Criação das linhas dos produtos na tabela
const createRowProducts = (produtosFiltrados) => {
  let tHead = document.querySelector("thead");
  let tbody = document.querySelector("tbody");
  let footer = document.querySelector("footer");

  tbody.innerHTML = ""; // Limpa a tabela antes de renderizar

  // Verifica se o cabeçalho já existe, se não, cria o cabeçalho
  if (!tHead.hasChildNodes()) {
    const createTrHead = document.createElement("tr");
    createTrHead.innerHTML = `
      <th>COD</th>
      <th>NOME</th>
      <th>VALOR DA VENDA</th>
      <th>UNIDADE DE MEDIDA</th>
      <th>CATEGORIA</th>
      <th>EDITAR</th>
    `;
    tHead.appendChild(createTrHead); // Adiciona o cabeçalho ao thead
  }

  footer.style.position = "relative";

  produtosFiltrados.forEach((item) => {
    const createTr = document.createElement("tr");
    createTr.innerHTML = `
      <td>${item.id}</td>
      <td>${item.nome}</td>
      <td>${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(item.valor)}</td>
      <td>${item.unidadereferencia}</td>
      <td>${item.categoria}</td>
      <td>
        <div class="divDropdowGear">
          <button class="buttonGear" id="idButtonGear-${item.id}">
            <!-- Ícone do botão de engrenagem -->
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <div class="optionsMenu" id="optionsMenu-${
            item.id
          }" style="display: none;">
            <button class="editOption" data-id="${item.id}">Editar</button>
            <button class="deleteOption" data-id="${item.id}">Excluir</button>
          </div>
        </div>
      </td>`;
    tbody.appendChild(createTr);

    // Manipula a exibição do menu de opções
    const buttonGear = document.querySelector(`#idButtonGear-${item.id}`);
    const optionsMenu = document.querySelector(`#optionsMenu-${item.id}`);

    buttonGear.addEventListener("click", () => {
      toggleDropdown(optionsMenu);
    });

    // Editar
    const editButton = optionsMenu.querySelector(".editOption");
    editButton.addEventListener("click", () => {
      window.open(`editarProduto.html?id=${item.id}`, "_blank");
    });

    // Excluir
    const deleteButton = optionsMenu.querySelector(".deleteOption");
    deleteButton.addEventListener("click", () => {
      deleteProduct(item.id);
    });
  });
};

// Função para deletar um produto
function deleteProduct(productId) {
  // Pergunta ao usuário se ele tem certeza de que deseja excluir o produto
  const confirmDelete = confirm(
    "Você tem certeza que deseja excluir este produto?"
  );
  if (!confirmDelete) return; // Se o usuário cancelar, a função retorna e nada é excluído.

  // Envia a solicitação para o backend
  fetch(`https://semprefrutasapi.shop/deleteProduto/${productId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "Produto excluído com sucesso.") {
        alert("Produto excluído com sucesso!");
        // Atualiza a lista de produtos após a exclusão
        getRowsProducts();
      } else {
        alert("Erro ao excluir o produto!");
      }
    })
    .catch((error) => {
      console.error("Erro ao excluir o produto:", error);
      alert("Erro ao excluir o produto!");
    });
}

getRowsProducts();

function sair() {
  window.location.href = "/index.html";
  localStorage.removeItem("token");
  localStorage.removeItem("userLogado");
  localStorage.removeItem("tipodeusuario");
}
