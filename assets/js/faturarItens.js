const form = document.querySelector("#todo-form");
const nome = document.querySelector("#nome-item");
const quantidade = document.querySelector("#quantidade-item");
const todoListUl = document.querySelector("#lista-de-faturamento");

let compras = [];

// Função para mostrar a lista de compras
function mostrarListaDeCompras(nome, quantidade, unidade, valor) {
  // Criando novo item de lista
  const li = document.createElement("li");

  const spanNome = document.createElement("span");
  spanNome.textContent = nome;

  const spanQuantidade = document.createElement("span");
  spanQuantidade.textContent = quantidade;

  const spanUnidade = document.createElement("span");
  spanUnidade.textContent = unidade;

  const spanValor = document.createElement("span");
  
  // Formatar o valor como R$ com 2 casas decimais
  const valorFormatado = new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL', 
    minimumFractionDigits: 2 
  }).format(valor);

  spanValor.textContent = valorFormatado;  // Atribuir o valor formatado ao span

  const buttonAdicionar = document.createElement("button");
  buttonAdicionar.textContent = "Remover";
  buttonAdicionar.addEventListener("click", (event) => {
    const liToRemove = event.target.parentElement;

    const nomeRemove = liToRemove.querySelector("span").textContent;

    compras = compras.filter((item) => item.nome !== nomeRemove);

    todoListUl.removeChild(liToRemove);
  });

  li.appendChild(spanNome);
  li.appendChild(spanUnidade);
  li.appendChild(spanQuantidade);
  li.appendChild(spanValor);
  li.appendChild(buttonAdicionar);

  todoListUl.appendChild(li);
}

// Função para buscar as características do item no servidor, incluindo a quantidade disponível
async function buscarCaracteristicasDoItem(nomeItem) {
  try {
    const response = await fetch(`http://localhost:3333/estoque?nomePesquisa=${nomeItem}`);
    const data = await response.json();

    // Retorna a unidade, o valor e a quantidade disponível do primeiro item encontrado
    if (data && data.length > 0) {
      return {
        unidade: data[0].unidadedereferencia,
        valor: data[0].valordevenda,
        quantidadeDisponivel: data[0].quantidadedoproduto // Adicionando a quantidade disponível
      };
    } else {
      return { unidade: "Unidade não encontrada", valor: 0, quantidadeDisponivel: 0 }; // Caso não encontrado
    }
  } catch (error) {
    console.error("Erro ao buscar características:", error);
    return { unidade: "Erro ao carregar unidade", valor: 0, quantidadeDisponivel: 0 }; // Erro
  }
}

// Evento para adicionar item na lista
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nomeDoItem = nome.value.toUpperCase();
  const quantidadeDeItens = parseFloat(quantidade.value);

  // Verificar se os campos estão preenchidos corretamente
  if (!nomeDoItem || isNaN(quantidadeDeItens) || quantidadeDeItens <= 0) {
    alert("Por favor, preencha todos os campos corretamente com uma quantidade válida.");
    return;  // Impede o envio do formulário se os campos forem inválidos
  }

  // Buscar unidade de referência, valor e quantidade disponível do servidor
  const { unidade, valor, quantidadeDisponivel } = await buscarCaracteristicasDoItem(nomeDoItem);

  // Verificar se a quantidade solicitada é maior que a disponível no estoque
  if (quantidadeDeItens > quantidadeDisponivel) {
    alert(`Quantidade solicitada excede a quantidade disponível no estoque. Quantidade disponível: ${quantidadeDisponivel}`);
    return;  // Impede a adição do item se a quantidade for maior
  }

  // Adicionar o item no array de compras
  compras.push({
    nome: nomeDoItem,
    quantidade: quantidadeDeItens,
    unidade: unidade,
    valor: valor
  });

  // Mostrar na lista de compras
  mostrarListaDeCompras(nomeDoItem, quantidadeDeItens, unidade, valor);

  // Limpar os campos
  nome.value = '';
  quantidade.value = '';
});


const botaoFaturar = document.querySelector("#button-faturar");

botaoFaturar.addEventListener("click", async () => {
  if (compras.length === 0) {
    alert("A lista de faturamento está vazia!");
    return;
  }

  try {
    // Envia os itens de compras para o backend no formato correto
    const response = await fetch("http://localhost:3333/faturamento", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itens: compras }), // Envia o array 'compras' dentro de um objeto com a chave 'itens'
    });

    const data = await response.json();

    if (response.ok) {
      alert("Faturamento realizado com sucesso!");

      // Limpa a lista de compras e atualiza o DOM
      compras = [];
      todoListUl.innerHTML = ""; // Remove todos os itens da lista na interface
    } else {
      alert(`Erro ao faturar: ${data.message}`);
    }
  } catch (error) {
    console.error("Erro ao processar o faturamento:", error);
    alert("Erro ao faturar os itens. Tente novamente.");
  }
});
