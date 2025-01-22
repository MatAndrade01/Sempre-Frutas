document.addEventListener("DOMContentLoaded", async function () {
  const button = document.getElementById("idButtonBuguer");
  const menu = document.getElementById("idDropDowMenu");

  // Lógica para abrir/fechar o menu dropdown
  button.addEventListener("click", function () {
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
        return;
      }
    }
  } catch (error) {
    console.error("Erro ao fazer a requisição:", error);
    alert("Erro ao conectar com o servidor");
  }

  const urlParams = new URLSearchParams(window.location.search);
  const produtoId = urlParams.get("id"); // Obtém o ID da URL

  if (!produtoId) {
    alert("ID do produto não encontrado");
    return;
  }

  // Preenche o campo 'id' com o ID obtido da URL
  document.getElementById("idCodigoDoProduto").value = produtoId;

  const form = document.getElementById("formEditarProduto");

  function preencherFormularioComProduto(produto) {
    document.getElementById("idCodigoDoProduto").value = produto.id;
    document.getElementById("idNameProduto").value = produto.nome;
    document.getElementById("Categoria").value = produto.categoria;
    document.getElementById("idUnidadeDeMedida").value =
      produto.unidadereferencia;
    document.getElementById("idValorDaCompra").value = produto.valor;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault(); // Evita o envio padrão do formulário

    const produtoData = {
      id: produtoId, // O ID obtido da URL será enviado
      nome: document.getElementById("idNameProduto").value,
      categoria: document.getElementById("Categoria").value,
      unidadereferencia: document.getElementById("idUnidadeDeMedida").value,
      valor: document.getElementById("idValorDaCompra").value,
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
      console.log(response);
      if (!response.ok) {
        mensagem.innerHTML = 'Erro ao atualiza o produto';
                
        divMensagem.style.display = 'flex';
        divMensagem.style.backgroundColor = '#f2dede'; // Altere para a cor desejada
        divMensagem.style.borderColor = '#d68d8d'; // Altere para a cor da borda desejada
      }

      const result = await response.json();
      mensagem.innerHTML = 'Produto atualizado com sucesso!';
      divMensagem.style.display = 'flex';
      setTimeout(() => {
        divMensagem.style.display = 'none';
        window.close();
    }, 2000);

      // Fecha a aba após o sucesso
      

    } catch (error) {
      console.error("Erro:", error);
    }
  });
});

function sair() {
  window.location.href = "/index.html";
  localStorage.removeItem("token");
  localStorage.removeItem("userLogado");
  localStorage.removeItem("tipodeusuario");
}
