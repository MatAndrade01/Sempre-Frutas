document.addEventListener("DOMContentLoaded", async function () {
  const userLogado = localStorage.getItem("userLogado");
  let logado = document.querySelector(".nomeLogado");

  logado.innerHTML = `Bem vindo ${userLogado}`;

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

  // Função para verificar o tipo de entrada selecionado
  function verificarSelect() {
    const getQuantidadePorCaixa = document.querySelector(
      "#idQuantidadePorCaixa"
    );
    const getLabelQuantidadePorCaixa = document.querySelector(
      "#idLabelQuantidadePorCaixa"
    );
    const getLabelQuantidade = document.querySelector("#idLabelQuantidade");
    const getValorTipoDeEntrada =
      document.querySelector("#idTipoDeEntrada").value;

    if (getValorTipoDeEntrada === "unidade") {
      getQuantidadePorCaixa.readOnly = true; // Torna o campo somente leitura
      getQuantidadePorCaixa.style.pointerEvents = "none";
      getQuantidadePorCaixa.removeAttribute("required");
      getLabelQuantidadePorCaixa.style.pointerEvents = "none";
      getQuantidadePorCaixa.style.backgroundColor = "#adadad"; // Muda a cor de fundo
      getLabelQuantidade.innerHTML = "Quantidade(UN)";
    } else {
      getQuantidadePorCaixa.disabled = false; // Habilita o campo se a condição não for atendida
      getQuantidadePorCaixa.style.backgroundColor = ""; // Reseta a cor de fundo
      getQuantidadePorCaixa.style.visibility = "visible"; // Torna o campo visível novamente
      getLabelQuantidade.innerHTML = "Quantidade De Caixas";
    }
  }

  // Adiciona um evento ao campo tipoDeEntrada para verificar a opção selecionada
  document
    .getElementById("idTipoDeEntrada")
    .addEventListener("change", verificarSelect);

  // Chama a função verificarSelect ao carregar a página
  verificarSelect();

  const button = document.getElementById("idButtonBuguer");
  const menu = document.getElementById("idDropDowMenu");

  // Função para alternar visibilidade do menu
  button.addEventListener("click", function () {
    if (menu.classList.contains("show")) {
      menu.classList.remove("show"); // Oculta o menu
    } else {
      menu.classList.add("show"); // Mostra o menu
    }
  });

  // Função para definir a data atual no input
  function definirDataAtual() {
    const inputData = document.getElementById("idInputDate");
    const dataAtual = new Date();
    const ano = dataAtual.getFullYear();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
    const dia = String(dataAtual.getDate()).padStart(2, "0");
    const dataFormatada = `${ano}-${mes}-${dia}`;
    inputData.value = dataFormatada;
  }

  // Chama a função para definir a data atual ao carregar a página
  definirDataAtual();

  const divMensagem = document.querySelector("#divMensagem");
  const mensagem = document.querySelector("#mensagem");

  // Interceptar o envio do formulário para enviar dados via fetch
  const form = document.getElementById("formEntrada");
  form.addEventListener("submit", async function (event) {
    event.preventDefault(); // Previne o envio tradicional do formulário

    // Coletar os dados do formulário
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Verifica se 'quantidadeporcaixa' está vazio ou nulo e substitui por 0
    if (!data.quantidadeporcaixa || data.quantidadeporcaixa === "") {
      data.quantidadeporcaixa = "0";
    }

    // Enviar os dados para a API
    try {
      const response = await fetch(
        "http://localhost:3333/entradaDeItems",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      console.log(response.body);

      if (response.ok) {
        // Limpar o formulário após o sucesso
        form.reset();
        mensagem.innerHTML = "Entrada feita com sucesso!";
        divMensagem.style.display = "flex";

        // Oculta a mensagem após 5 segundos
        setTimeout(() => {
          divMensagem.style.display = "none";
        }, 3000);

        definirDataAtual(); // Atualiza a data no campo
      } else {
        mensagem.innerHTML = "Erro ao dar entrada no produto";
        mensagem.style.color = "#b94a48";
        divMensagem.style.display = "flex";
        divMensagem.style.backgroundColor = "#f2dede"; // Altere para a cor desejada
        divMensagem.style.borderColor = "#d68d8d"; // Altere para a cor da borda desejada

        setTimeout(() => {
          divMensagem.style.display = "none";
          mensagem.style.color = "#04750ad0";
          divMensagem.style.display = "flex";
          divMensagem.style.backgroundColor = "#acd3aed0"; // Altere para a cor desejada
          divMensagem.style.borderColor = "#06570ad0"; // Altere para a cor da borda desejada
        }, 3000);
      }
    } catch (error) {
      console.error("Erro ao conectar com a API:", error);
    }
  });

  // Função para calcular o valor total (considerando a entrada como unidade ou caixa)
  function calcularValorTotal() {
    const tipoDeEntrada = document.getElementById("idTipoDeEntrada").value;
    const quantidadeInput = document.getElementById("idQuantidade");
    const valorCompraInput = document.getElementById("idValorDaCompra");
    const valorTotalInput = document.getElementById("idValorTotal");

    const quantidadeValor = parseFloat(quantidadeInput.value);
    const valorCompra = parseFloat(valorCompraInput.value);

    let valorTotal = 0;

    // Se a entrada for por "unidade", faz o cálculo baseado na quantidade
    if (tipoDeEntrada === "unidade") {
      valorTotal = valorCompra;
    }
    // Se a entrada for por "caixa", faz o cálculo baseado na quantidade por caixa
    else if (tipoDeEntrada === "caixa") {
      valorTotal = quantidadeValor * valorCompra;
    }

    valorTotalInput.value = valorTotal.toFixed(2); // Exibe o valor total no campo
  }

  // Adiciona os ouvintes de eventos para calcular o valor total
  const quantidadeInput = document.getElementById("idQuantidade");
  const valorCompraInput = document.getElementById("idValorDaCompra");
  quantidadeInput.addEventListener("input", calcularValorTotal);
  valorCompraInput.addEventListener("input", calcularValorTotal);
  document
    .getElementById("idQuantidadePorCaixa")
    .addEventListener("input", calcularValorTotal);
});

function sair() {
  window.location.href = "/index.html";
  localStorage.removeItem("token");
  localStorage.removeItem("userLogado");
  localStorage.removeItem("tipodeusuario");
}
