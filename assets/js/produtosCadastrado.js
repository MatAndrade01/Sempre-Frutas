document.addEventListener('DOMContentLoaded', function() {
  // Menu do botão burger
  const button = document.getElementById('idButtonBuguer');
  const menu = document.getElementById('idDropDowMenu');
  button.addEventListener('click', function() {
    menu.classList.toggle('show');
  });

  // Dropdown de opções com botão de engrenagem
  const buttonsGear = document.querySelectorAll('.buttonGear');
  const dropLinks = document.querySelectorAll('.optionsMenu');

  buttonsGear.forEach(button => {
    button.addEventListener('click', function(event) {
      event.stopPropagation();
      const dropLink = button.nextElementSibling;
      toggleDropdown(dropLink);
    });
  });

  document.addEventListener('click', function(event) {
    dropLinks.forEach(dropLink => {
      if (dropLink.style.display === 'block' && !dropLink.contains(event.target)) {
        dropLink.style.display = 'none';
      }
    });
  });

  // Função para alternar a exibição do dropdown
  function toggleDropdown(dropdown) {
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  }

  // Paginação e pesquisa de produtos
  let currentPage = 1;
  const productsPerPage = 15;
  let allProducts = [];

  const getRowsProducts = () => {
    document.getElementById('searchForm').addEventListener('submit', async function(event) {
      event.preventDefault();

      const nomepesquisa = document.querySelector('input[name="nomepesquisa"]').value;
      const url = `http://localhost:3333/produtosCadastrado?nomepesquisa=${nomepesquisa}`;

      const carregando = document.createElement('span');
      carregando.classList.add('carregando');
      document.querySelector('body').appendChild(carregando);

      const responseFetch = await fetch(url);
      const responseJson = await responseFetch.json();
      carregando.classList.remove('carregando');

      // Filtra os produtos
      allProducts = responseJson.filter(item => 
        nomepesquisa ? item.nome.toLowerCase().includes(nomepesquisa.toLowerCase()) : true
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

    const paginationDiv = document.querySelector('.pagination');
    paginationDiv.style.display = produtosFiltrados.length > 0 ? 'flex' : 'none';

    const footer = document.querySelector('footer');
    footer.style.position = produtosFiltrados.length < 6 ? 'fixed' : 'relative';
    if (produtosFiltrados.length < 6) footer.style.bottom = '0';
  };

  // Atualiza os botões de navegação
  const updatePaginationButtons = () => {
    const prevButton = document.getElementById('prevBtn');
    const nextButton = document.getElementById('nextBtn');

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
    const tHead = document.querySelector('thead');
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';

    tHead.style.opacity = '1';

    produtosFiltrados.forEach(item => {
      const createTr = document.createElement('tr');
      createTr.innerHTML = `
        <td>${item.id}</td>
        <td>${item.nome}</td>
        <td>R$ ${item.valor.replace('.', ',')}</td>
        <td>${item.unidadereferencia}</td>
        <td>${item.fornecedor}</td>
        <td>${item.categoria}</td>
        <td>
          <div class="divDropdowGear">
            <button class="buttonGear" id="idButtonGear-${item.id}">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <div class="optionsMenu" id="optionsMenu-${item.id}" style="display: none;">
              <button class="editOption" data-id="${item.id}">Editar</button>
              <button class="deleteOption" data-id="${item.id}">Excluir</button>
            </div>
          </div>
        </td>`;
      tbody.appendChild(createTr);

      // Manipula a exibição do menu de opções
      const buttonGear = document.querySelector(`#idButtonGear-${item.id}`);
      const optionsMenu = document.querySelector(`#optionsMenu-${item.id}`);

      buttonGear.addEventListener('click', () => {
        toggleDropdown(optionsMenu);
      });

      // Editar
      const editButton = optionsMenu.querySelector('.editOption');
      editButton.addEventListener('click', () => {
        window.open(`editarProduto.html?id=${item.id}`, '_blank');
      });

      // Excluir
      const deleteButton = optionsMenu.querySelector('.deleteOption');
      deleteButton.addEventListener('click', () => {
        deleteProduct(item.id);
      });
    });
  };

  // Função para excluir produto
  const deleteProduct = async (id) => {
    const confirmDelete = confirm("Tem certeza de que deseja excluir este produto?");
    if (confirmDelete) {
      const response = await fetch(`http://localhost:3333/deleteProduto/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Produto excluído com sucesso!');
        allProducts = allProducts.filter(item => item.id !== id);
        updateProductsDisplay();
      } else {
        alert('Erro ao excluir o produto.');
      }
    }
  };

  getRowsProducts();
});
