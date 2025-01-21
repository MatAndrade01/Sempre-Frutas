document.addEventListener("DOMContentLoaded", async function () {
  const button = document.getElementById("idButtonBuguer");
  const menu = document.getElementById("idDropDowMenu");

  button.addEventListener("click", function () {
    // Verifica se o menu está visível
    if (menu.classList.contains("show")) {
      menu.classList.remove("show"); // Oculta o menu
    } else {
      menu.classList.add("show"); // Mostra o menu
    }
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

  function sair() {
    window.location.href = "/index.html";
    localStorage.removeItem("token");
    localStorage.removeItem("userLogado");
    localStorage.removeItem("tipodeusuario");
  }

  const nomeProdutoInput = document.getElementById("idNomeDoProduto"); // Campo de nome do produto
  const quantidadeInput = document.getElementById("idQuantidadeSaida"); // Campo de quantidade
  const valorTotalInput = document.getElementById("idValorDaSaida"); // Campo de valor total
  const urlBase = "https://semprefrutasapi.shop/produtosCadastrado"; // Base URL para a API

  let valorDaVenda = 0; // Variável para armazenar o valor de venda do produto

  // Função para buscar o valor de venda do produto
  async function fetchValorDaVenda() {
    const nomeProduto = nomeProdutoInput.value.trim();

    if (!nomeProduto) return; // Se não houver nome de produto, não faz nada

    const url = `${urlBase}?nomepesquisa=${encodeURIComponent(nomeProduto)}`;

    try {
      const response = await fetch(url);
      const produtos = await response.json();

      if (produtos.length > 0) {
        valorDaVenda = produtos[0]?.valor || 0; // Obtém o valor do produto (valor)
        calcularValorTotal(); // Recalcula o valor total
      } else {
        valorDaVenda = 0; // Se não encontrar o produto, reseta o valor
        calcularValorTotal();
      }
    } catch (error) {
      console.error("Erro ao buscar os produtos:", error);
      valorDaVenda = 0;
      calcularValorTotal();
    }
  }

  // Função para calcular o valor total da saída
  function calcularValorTotal() {
    const quantidade = parseFloat(quantidadeInput.value) || 0;
    const valorTotal = quantidade * valorDaVenda;
    valorTotalInput.value = valorTotal.toFixed(2); // Atualiza o valor no campo
  }

  // Adiciona um listener no campo de nome do produto para disparar a busca e o cálculo
  nomeProdutoInput.addEventListener("input", fetchValorDaVenda);

  // Adiciona um listener para recalcular o valor total quando a quantidade for alterada
  quantidadeInput.addEventListener("input", calcularValorTotal);

  // Função para definir a data atual no input de data
  function definirDataAtual() {
    const inputData = document.getElementById("idDataSaida");
    if (inputData) {
      const dataAtual = new Date();
      const ano = dataAtual.getFullYear();
      const mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
      const dia = String(dataAtual.getDate()).padStart(2, "0");
      const dataFormatada = `${ano}-${mes}-${dia}`;
      inputData.value = dataFormatada;
    } else {
      console.error("Elemento de input de data não encontrado");
    }
  }

  const divMensagem = document.querySelector('#divMensagem');
  const mensagem = document.querySelector('#mensagem');

  // Chama a função para definir a data atual no campo de data
  definirDataAtual();

  document
    .getElementById("formSainda")
    .addEventListener("submit", async (event) => {
      event.preventDefault(); // Impede o recarregamento da página

      const nome = document.getElementById("idNomeDoProduto").value.trim();
      const quantidade = parseInt(
        document.getElementById("idQuantidadeSaida").value
      );
      const tipoSaida = document.getElementById("idTipoDeSaida").value;
      const valorDaSaida = parseFloat(
        document.getElementById("idValorDaSaida").value
      ); // Convertendo para número

      // Verificando se os campos são válidos
      if (!nome || !quantidade || quantidade <= 0 || isNaN(valorDaSaida)) {
        alert("Preencha todos os campos corretamente.");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3333/saidaDeItem",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ nome, quantidade, tipoSaida, valorDaSaida }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          mensagem.innerHTML='Saída registrada com sucesso!';
          divMensagem.style.display = 'flex'; 

          // Oculta a mensagem após 3 segundos
          setTimeout(() => {
            divMensagem.style.display = 'none';
          }, 3000);

          // Limpar os campos do formulário
          document.getElementById("formSainda").reset();
        } else {
          console.log(data.message);
          mensagem.innerHTML = 'Erro ao dar saida no produto';
          mensagem.style.color = '#b94a48'
          divMensagem.style.display = 'flex';
          divMensagem.style.backgroundColor = '#f2dede'; // Altere para a cor desejada
          divMensagem.style.borderColor = '#d68d8d'; // Altere para a cor da borda desejada
          setTimeout(() => {
            divMensagem.style.display = 'none';
            mensagem.style.color = '#04750ad0'
            divMensagem.style.display = 'flex';
            divMensagem.style.backgroundColor = '#acd3aed0'; // Altere para a cor desejada
            divMensagem.style.borderColor = '#06570ad0'; // Altere para a cor da borda desejada
          }, 3000);
        }
      } catch (error) {
        console.error("Erro ao enviar saída:", error);
      }
    });
});
