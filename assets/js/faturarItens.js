const form = document.querySelector("#todo-form");
const nome = document.querySelector("#nome-item");
const quantidade = document.querySelector("#quantidade-item");
const todoListUl = document.querySelector("#lista-de-faturamento");

let compras = [];

// Função para mostrar a lista de compras
function mostrarListaDeCompras(nome, quantidade, unidade, valor) {
  const li = document.createElement("li");

  const spanNome = document.createElement("span");
  spanNome.textContent = nome;

  const spanQuantidade = document.createElement("span");
  spanQuantidade.textContent = quantidade;

  const spanUnidade = document.createElement("span");
  spanUnidade.textContent = unidade;

  const spanValor = document.createElement("span");
  const valorFormatado = new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL', 
    minimumFractionDigits: 2 
  }).format(valor);
  spanValor.textContent = valorFormatado;

  const buttonAdicionar = document.createElement("button");
  buttonAdicionar.textContent = "Remover";
  buttonAdicionar.addEventListener("click", (event) => {
    const liToRemove = event.target.parentElement;
    const nomeRemove = liToRemove.querySelector("span").textContent;

    compras = compras.filter((item) => item.nome !== nomeRemove);

    todoListUl.removeChild(liToRemove);

    // Recalcular o valor total ao remover o item
    calcularValorTotal();
  });

  li.appendChild(spanNome);
  li.appendChild(spanUnidade);
  li.appendChild(spanQuantidade);
  li.appendChild(spanValor);
  li.appendChild(buttonAdicionar);

  todoListUl.appendChild(li);
}

// Função para buscar características do item no servidor
async function buscarCaracteristicasDoItem(nomeItem) {
  try {
    const response = await fetch(`http://localhost:3333/estoque?nomePesquisa=${nomeItem}`);
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        unidade: data[0].unidadedereferencia,
        valor: data[0].valordevenda,
        quantidadeDisponivel: data[0].quantidadedoproduto
      };
    } else {
      return { unidade: "Unidade não encontrada", valor: 0, quantidadeDisponivel: 0 };
    }
  } catch (error) {
    console.error("Erro ao buscar características:", error);
    return { unidade: "Erro ao carregar unidade", valor: 0, quantidadeDisponivel: 0 };
  }
}

// Função para calcular o valor total
function calcularValorTotal() {
  const valorTotal = compras.reduce((total, item) => {
    return total + item.quantidade * item.valor;
  }, 0);

  // Atualizar o input com o valor total
  const inputValorTotal = document.querySelector("#valor-total");
  inputValorTotal.value = valorTotal.toFixed(2);
}

// Evento para adicionar item na lista
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nomeDoItem = nome.value.toUpperCase();
  const quantidadeDeItens = parseFloat(quantidade.value);

  if (!nomeDoItem || isNaN(quantidadeDeItens) || quantidadeDeItens <= 0) {
    alert("Por favor, preencha todos os campos corretamente com uma quantidade válida.");
    return;
  }

  const { unidade, valor, quantidadeDisponivel } = await buscarCaracteristicasDoItem(nomeDoItem);

  if (quantidadeDeItens > quantidadeDisponivel) {
    alert(`Quantidade solicitada excede a quantidade disponível no estoque. Quantidade disponível: ${quantidadeDisponivel}`);
    return;
  }

  compras.push({
    nome: nomeDoItem,
    quantidade: quantidadeDeItens,
    unidade: unidade,
    valor: valor
  });

  mostrarListaDeCompras(nomeDoItem, quantidadeDeItens, unidade, valor);

  // Recalcular o valor total
  calcularValorTotal();

  // Limpar os campos
  nome.value = '';
  quantidade.value = '';
});

// Evento do botão Faturar
const botaoFaturar = document.querySelector("#button-faturar");

botaoFaturar.addEventListener("click", async () => {
  if (compras.length === 0) {
    alert("A lista de faturamento está vazia!");
    return;
  }

  // Obtendo os dados do formulário de faturamento
  const tipodepagamento = document.querySelector("#tipo-de-pagamento").value; // Tipo de pagamento
  const valorpago = parseFloat(document.querySelector("#valor-pago").value); // Valor pago
  const valortotal = parseFloat(document.querySelector("#valor-total").value); // Valor total
  console.log(tipodepagamento)
  console.log(valorpago)

  if (!tipodepagamento || isNaN(valorpago) || isNaN(valortotal)) {
    alert("Por favor, preencha todos os campos do formulário corretamente.");
    return;
  }

  // Criando o objeto de dados a ser enviado
  const dadosFaturamento = {
    tipodepagamento,
    valorpago,
    valortotal,
    itens: compras
  };

  try {
    const response = await fetch("http://localhost:3333/faturamento", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosFaturamento), // Enviar todos os dados juntos
    });

    const data = await response.json();

    if (response.ok) {
      alert("Faturamento realizado com sucesso!");
      compras = [];
      todoListUl.innerHTML = ""; // Limpa os itens na interface
      calcularValorTotal(); // Zera o valor total
    } else {
      alert(`Erro ao faturar: ${data.message}`);
    }
  } catch (error) {
    console.error("Erro ao processar o faturamento:", error);
    alert("Erro ao faturar os itens. Tente novamente.");
  }

  // Limpa o campo de valor pago
  document.querySelector("#valor-pago").value = '';  // Limpa o campo de "valor pago"
});
