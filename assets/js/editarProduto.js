document.addEventListener("DOMContentLoaded", async function () {
  const button = document.getElementById("idButtonBuguer");
  const menu = document.getElementById("idDropDowMenu");

  // Lógica para abrir/fechar o menu dropdown
  button.addEventListener("click", function () {
    menu.classList.toggle("show");
  });

  // Seleciona todos os inputs do grupo
  const radios = document.querySelectorAll('input[name="opcaocadastro"]');
  const quantidadeMinima = document.getElementById("idQuantidadeMinima");
  const valorPromocao = document.getElementById("idValorPromocao");

  // Função para aplicar lógica com base no radio selecionado
  function atualizarEstado() {
    const selecionado = document.querySelector(
      'input[name="opcaocadastro"]:checked'
    ).value;

    if (selecionado === "Não") {
      quantidadeMinima.removeAttribute("required");
      valorPromocao.removeAttribute("required");
      quantidadeMinima.style.backgroundColor = "#adadad";
      valorPromocao.style.backgroundColor = "#adadad";
      quantidadeMinima.style.pointerEvents = "none";
      valorPromocao.style.pointerEvents = "none";
      quantidadeMinima.disabled = true;
      valorPromocao.disabled = true;
      document.getElementById("idQuantidadeMinima").value = "";
      document.getElementById("idValorPromocao").value = "";

    } else {
      quantidadeMinima.setAttribute("required", true);
      valorPromocao.setAttribute("required", true);
      quantidadeMinima.style.backgroundColor = "";
      valorPromocao.style.backgroundColor = "";
      quantidadeMinima.style.pointerEvents = "auto";
      valorPromocao.style.pointerEvents = "auto";
      quantidadeMinima.disabled = false;
      valorPromocao.disabled = false;
    }
  }

  // Adiciona o evento 'change' para cada radio
  radios.forEach((radio) => {
    radio.addEventListener("change", atualizarEstado);
  });

  // Verifica o estado inicial ao carregar a página
  window.onload = atualizarEstado;

  // Obtendo o login do usuário
  const userLogado = localStorage.getItem("userLogado");
  const logado = document.querySelector(".nomeLogado");

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
      if (tipodeusuario === "caixa") {
        alert("Você não tem acesso a essa página!");
        window.location.href = "./home.html";
        return;
      }
    }
  } catch (error) {
    console.error("Erro ao fazer a requisição:", error);
    alert("Erro ao conectar com o servidor");
  }

  // Obtém o ID do produto da URL
  const urlParams = new URLSearchParams(window.location.search);
  const produtoId = urlParams.get("id");

  if (!produtoId) {
    alert("ID do produto não encontrado");
    return;
  }

  // Preenche o campo 'id' com o ID obtido da URL
  document.getElementById("idCodigoDoProduto").value = produtoId;

  // Função para buscar os detalhes do produto pelo ID
  async function carregarProduto(produtoId) {
    try {
      const response = await fetch(`http://localhost:3333/produtosCadastrado/${produtoId}`);
      if (!response.ok) {
        throw new Error("Não foi possível carregar o produto.");
      }
      const produto = await response.json();
      preencherFormularioComProduto(produto);
    } catch (error) {
      console.error("Erro ao carregar o produto:", error);
      alert("Erro ao carregar as informações do produto.");
    }
  }

  // Função para preencher o formulário com os dados do produto
  function preencherFormularioComProduto(produto) {
    document.getElementById("idCodigoDoProduto").value = produto.id;
    document.getElementById("idNameProduto").value = produto.nome;
    document.getElementById("Categoria").value = produto.categoria;
    document.getElementById("idUnidadeDeMedida").value =
      produto.unidadereferencia;
    document.getElementById("idValorDaCompra").value = produto.valor;

    // Preencher os valores de promoção e quantidade mínima, se necessário
    document.querySelector(
      `input[name="opcaocadastro"][value="${produto.opcaocadastro}"]`
    ).checked = true;

    if (produto.opcaocadastro === "Sim") {
      document.getElementById("idQuantidadeMinima").value =
        produto.quantidademinima;
      document.getElementById("idValorPromocao").value = produto.valorpromocao;
      quantidadeMinima.setAttribute("required", true);
      valorPromocao.setAttribute("required", true);
      quantidadeMinima.style.backgroundColor = ""; // Reseta a cor de fundo
      valorPromocao.style.backgroundColor = ""; // Reseta a cor de fundo
      quantidadeMinima.style.pointerEvents = "auto"; // Habilita interações
      valorPromocao.style.pointerEvents = "auto"; // Habilita interações
      quantidadeMinima.disabled = false; // Habilita o campo
      valorPromocao.disabled = false; // Habilita o campo
    }
  }

  // Carrega as informações do produto ao abrir a página
  carregarProduto(produtoId);

  // Lógica para atualizar o produto ao enviar o formulário
  const form = document.getElementById("formEditarProduto");
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const produtoData = {
      id: produtoId,
      nome: document.getElementById("idNameProduto").value,
      categoria: document.getElementById("Categoria").value,
      unidadereferencia: document.getElementById("idUnidadeDeMedida").value,
      valor: document.getElementById("idValorDaCompra").value,
      opcaocadastro: document.querySelector(
        'input[name="opcaocadastro"]:checked'
      ).value,
      quantidademinima: document.getElementById("idQuantidadeMinima").value,
      valorpromocao: document.getElementById("idValorPromocao").value,
    };

    try {
      const response = await fetch(
        `http://localhost:3333/atualizarProduto/${produtoId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(produtoData),
        }
      );

      if (!response.ok) {
        mensagem.innerHTML = 'Erro ao atualiza o produto';
                
        divMensagem.style.display = 'flex';
        divMensagem.style.backgroundColor = '#f2dede'; // Altere para a cor desejada
        divMensagem.style.borderColor = '#d68d8d'; // Altere para a cor da borda desejada
      } else if (response.ok) {
        mensagem.innerHTML = 'Produto atualizado com sucesso!';
        divMensagem.style.display = 'flex';
        setTimeout(() => {
          divMensagem.style.display = 'none';
          window.close();
        }, 2000);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao atualizar o produto.");
    }
  });
});

function sair() {
  window.location.href = "/index.html";
  localStorage.removeItem("token");
  localStorage.removeItem("userLogado");
  localStorage.removeItem("tipodeusuario");
}
