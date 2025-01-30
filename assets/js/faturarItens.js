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

  // Função para sair
  function sair() {
    window.location.href = '/index.html';
    localStorage.removeItem('token');
    localStorage.removeItem('userLogado');
  }

const form = document.querySelector("#todo-form");
const nome = document.querySelector("#nome-item");
const quantidade = document.querySelector("#quantidade-item");
const todoListUl = document.querySelector("#lista-de-faturamento");

function verificarSelect() {
  const tipoDeCompra = document.querySelector("#tipo-de-compra");
  const valorDaEntrega = document.querySelector("#valor-da-entrega");

  if (tipoDeCompra.value === "LOJA") {
    // Corrigido aqui
    valorDaEntrega.readOnly = true;
    valorDaEntrega.style.pointerEvents = "none";
    valorDaEntrega.style.backgroundColor = "#adadad";
  } else {
    // Se for outro tipo de compra, habilitar o campo
    valorDaEntrega.readOnly = false;
    valorDaEntrega.style.pointerEvents = "auto";
    valorDaEntrega.style.backgroundColor = ""; // Reseta a cor de fundo
  }
}

// Adiciona um evento ao campo tipoDeCompra para verificar a opção selecionada
document
  .getElementById("tipo-de-compra")
  .addEventListener("change", verificarSelect);

// Chama a função verificarSelect ao carregar a página
window.addEventListener("load", verificarSelect); // Garantir que seja chamado quando a página carregar

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
  if (unidade === 'KG') {
    const valorFormatadoKG = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 3,
    }).format(valor);
    spanValor.textContent = valorFormatadoKG;
  } else if (unidade === 'UN') {
    const valorFormatadoUN = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(valor);
    spanValor.textContent = valorFormatadoUN;
  };

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
    const response = await fetch(
      `http://localhost:3333/estoque?nomePesquisa=${nomeItem}`
    );
    const data = await response.json();
    console.log(data); //Aqui
    const quantidade = document.querySelector("#quantidade-item");
    if (data && data.length > 0) {
      if (data[0].opcaocadastro === "Sim") {
        if(quantidade.value % data[0].quantidademinima === 0){

          return {
            unidade: data[0].unidadedereferencia,
            valor: data[0].valorpromocao,
            quantidadeDisponivel: data[0].quantidadedoproduto,
          }
        } else {
          return {
            unidade: data[0].unidadedereferencia,
            valor: data[0].valordevenda,
            quantidadeDisponivel: data[0].quantidadedoproduto,
          }
        }
      } else if (data[0].opcaocadastro === "Sim" && data[0].unidadedereferencia === "KG") {
        
        if(quantidade.value % data[0].quantidademinima === 0){

          return {
            unidade: data[0].unidadedereferencia,
            valor: data[0].valorg,
            quantidadeDisponivel: data[0].quantidadedoproduto,
          }
        } else {
          return {
            unidade: data[0].unidadedereferencia,
            valor: data[0].valorg,
            quantidadeDisponivel: data[0].quantidadedoproduto,
          }
        }
      } else if (data[0].opcaocadastro === "Não" && data[0].unidadedereferencia === "KG") {
        return {
          unidade: data[0].unidadedereferencia,
          valor: data[0].valorg,
          quantidadeDisponivel: data[0].quantidadedoproduto,
        };
      } else if (data[0].opcaocadastro === "Não") {
        return {
          unidade: data[0].unidadedereferencia,
          valor: data[0].valordevenda,
          quantidadeDisponivel: data[0].quantidadedoproduto,
        };
      }
    } else {
      return {
        unidade: "Unidade não encontrada",
        valor: 0,
        quantidadeDisponivel: 0,
      };
    }
  } catch (error) {
    console.error("Erro ao buscar características:", error);
    return {
      unidade: "Erro ao carregar unidade",
      valor: 0,
      quantidadeDisponivel: 0,
    };
  }
}

// Seleciona o campo de valor da entrega
const campoValorDaEntrega = document.querySelector("#valor-da-entrega");

// Atualiza o valor total em tempo real ao digitar no campo de valor da entrega
campoValorDaEntrega.addEventListener("input", calcularValorTotal);

// Ajuste o cálculo do valor total se necessário
function calcularValorTotal() {
  const valordaentrega = parseFloat(campoValorDaEntrega.value) || 0;

  const valorTotal =
    compras.reduce((total, item) => {
      return total + item.quantidade * item.valor;
    }, 0) + valordaentrega;

  // Atualizar o input com o valor total formatado
  const inputValorTotal = document.querySelector("#valor-total");
  inputValorTotal.value = valorTotal.toFixed(2);
}

// Evento para adicionar item na lista
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nomeDoItem = nome.value.toUpperCase();
  const quantidadeDeItens = parseFloat(quantidade.value);
  const divMensagem = document.querySelector('#divMensagem');
  const mensagem = document.querySelector('#mensagem');

  if (!nomeDoItem || isNaN(quantidadeDeItens) || quantidadeDeItens <= 0) {
    mensagem.innerHTML = 
      "Por favor, preencha todos os campos corretamente com uma quantidade válida.";
    divMensagem.style.display = 'flex';
    nome.focus()
    setTimeout(() => {
      divMensagem.style.display = 'none';
    }, 10000);
    return;
  }

  const { unidade, valor, quantidadeDisponivel } =
    await buscarCaracteristicasDoItem(nomeDoItem);

  if (quantidadeDeItens > quantidadeDisponivel) {
    mensagem.innerHTML = 
      `Quantidade solicitada excede a quantidade disponível no estoque. Quantidade disponível: ${quantidadeDisponivel}`;
    divMensagem.style.display = 'flex';
    quantidade.focus();
    setTimeout(() => {
      divMensagem.style.display = 'none';
    }, 10000);
    return;
  }

  compras.push({
    nome: nomeDoItem,
    quantidade: quantidadeDeItens,
    unidade: unidade,
    valor: valor,
  });

  mostrarListaDeCompras(nomeDoItem, quantidadeDeItens, unidade, valor);

  // Recalcular o valor total
  calcularValorTotal();

  // Limpar os campos
  nome.value = "";
  quantidade.value = "";
});

// Evento do botão Faturar
const botaoFaturar = document.querySelector("#button-faturar");

botaoFaturar.addEventListener("click", async () => {
  if (compras.length === 0) {
    mensagem.innerHTML = 
      "A lista de faturamento está vazia!";
    divMensagem.style.display = 'flex';
    nome.focus();
    setTimeout(() => {
      divMensagem.style.display = 'none';
    }, 10000);
    return;
  }

  // Obtendo os dados do formulário de faturamento
  const tipodepagamento = document.querySelector("#tipo-de-pagamento").value;
  const valorpago = parseFloat(document.querySelector("#valor-pago").value);
  const valortotal = parseFloat(document.querySelector("#valor-total").value);
  const nomedocliente = document.querySelector("#nome-do-cliente").value;
  const cidadedocliente = document.querySelector("#cidade-do-cliente").value;
  const enderecodocliente = document.querySelector(
    "#endereco-do-cliente"
  ).value;
  const numerodacasadocliente = document.querySelector("#numero-da-casa").value;
  const bairrodocliente = document.querySelector("#bairro-do-cliente").value;
  const tipodecompra = document.querySelector("#tipo-de-compra").value;
  const valordaentrega = document.querySelector("#valor-da-entrega").value;

  if (!tipodepagamento || isNaN(valorpago) || isNaN(valortotal)) {
    mensagem.innerHTML = 
    "Por favor, preencha todos os campos do formulário corretamente.";
    divMensagem.style.display = 'flex';
    valorpago.focus();
    setTimeout(() => {
      divMensagem.style.display = 'none';
    }, 10000);
    return;
  }

  // Criando o objeto de dados a ser enviado
  const dadosFaturamento = {
    tipodepagamento,
    valorpago,
    valortotal,
    itens: compras,
    cliente: nomedocliente, // Exemplo de cliente
    cpfCliente: "123.456.789-00", // Exemplo de CPF do cliente
    empresa: "Minha Empresa LTDA",
    cnpj: "12.345.678/0001-99",
    endereco: "Rua Exemplo, 123, Cidade, Estado",
    enderecocliente: `${bairrodocliente}, ${enderecodocliente}, ${numerodacasadocliente}, ${cidadedocliente}`,
    tipodecompra,
    valordaentrega,
  };

  try {
    const response = await fetch("http://localhost:3333/faturamento", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosFaturamento),
    });

    const data = await response.json();

    if (response.ok) {
      // Gerar e abrir o cupom fiscal para impressão
      abrirTelaDeImpressao(dadosFaturamento);

      // Limpar a lista e o valor total
      compras = [];
      todoListUl.innerHTML = "";
      calcularValorTotal();
    } else {
      alert(`Erro ao faturar: ${data.message}`);
    }
  } catch (error) {
    console.error("Erro ao processar o faturamento:", error);
    mensagem.innerHTML = 
    "Erro ao faturar os itens. Tente novamente mais tarde.";
    divMensagem.style.display = 'flex';
    setTimeout(() => {
      divMensagem.style.display = 'none';
    }, 10000);
  }

  // Limpa o campo de valor pago
  document.querySelector("#valor-pago").value = "";
  document.querySelector("#nome-do-cliente").value = "";
  document.querySelector("#bairro-do-cliente").value = "";
  document.querySelector("#cidade-do-cliente").value = "";
  document.querySelector("#endereco-do-cliente").value = "";
  document.querySelector("#numero-da-casa").value = "";
  document.querySelector("#valor-da-entrega").value = "";
});

// Função para gerar e abrir a tela de impressão do cupom fiscal
function abrirTelaDeImpressao(dadosFaturamento) {
  // Criar o conteúdo HTML do cupom fiscal
  const cupom = `
    <html>
      <head>
        <title>Cupom Fiscal</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            padding: 20px;
            line-height: 1.4;
            font-size: 12px;
          }

          h2 {
            text-align: center;
            font-size: 16px;
            margin-bottom: 10px;
            font-weight: bold;
          }

          .dados-empresa,
          .dados-cliente {
            margin-bottom: 10px;
          }

          .dados-empresa p,
          .dados-cliente p {
            margin: 5px 0;
          }

          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 12px;
          }

          .table th,
          .table td {
            padding: 6px;
            text-align: left;
          }

          .table th {
            background-color: #f4f4f4;
            font-weight: bold;
          }

          .total {
            font-size: 1.2em;
            font-weight: bold;
            text-align: right;
            margin-top: 10px;
          }

          .center {
            text-align: center;
          }

          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 10px;
            color: #888;
          }
        </style>
      </head>
      <body>
        <h2>********** CUPOM FISCAL **********</h2>

        <div class="dados-empresa">
          <p><strong>Empresa:</strong> Sempre Frutas Selecionadas</p>
          <p><strong>CNPJ:</strong> 18.863.146/00001-26</p>
          <p><strong>Endereço:</strong> Feira Livre do Paulista</p>
          <p><strong>Telefone/WhatsApp:</strong> (81) 9 8250-8317</p>
        </div>

        <div class="dados-cliente">
          <p><strong>Cliente:</strong> ${dadosFaturamento.cliente}</p>
          <p><strong>Endereço do Cliente:</strong> ${
            dadosFaturamento.enderecocliente
          }</p>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Produto(s)</th>
              <th>Quantidade</th>
              <th>Preço Unitário</th>
              <th>Sub Total</th>
            </tr>
          </thead>
          <tbody>
            ${dadosFaturamento.itens
              .map(
                (item) => `
              <tr>
                <td>${item.nome}</td>
                <td>${item.quantidade}</td>
                <td>${new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  minimumFractionDigits: 3, // Mínimo de 3 casas decimais
                  maximumFractionDigits: 3  // Máximo de 3 casas decimais
                }).format(item.valor)}</td>
                <td>${new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(item.quantidade * item.valor)}</td>
              </tr>
            `
              )
              .join("")}
            <tr>
              <td>${dadosFaturamento.tipodecompra}</td>
              <td></td>
              <td></td>
              <td>${new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(dadosFaturamento.valordaentrega)}</td>
            </tr>
          </tbody>
        </table>

        <div class="total">
          <strong>Total: </strong>${new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(dadosFaturamento.valortotal)}
        </div>
        <div>
          <strong>Forma de Pagamento:${
            dadosFaturamento.tipodepagamento
          }</strong>
        </div>

        <div class="footer">
          <p>Obrigado pela preferência!</p>
        </div>
      </body>
    </html>
  `;

  const novaJanela = window.open("", "_blank");
  novaJanela.document.write(cupom);
  novaJanela.document.close();

  novaJanela.print();
}
