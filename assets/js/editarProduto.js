document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const produtoId = urlParams.get('id'); // Obtém o ID da URL

    if (!produtoId) {
        alert('ID do produto não encontrado');
        return;
    }

    // Preenche o campo 'id' com o ID obtido da URL
    document.getElementById('idCodigoDoProduto').value = produtoId;

    const button = document.getElementById('idButtonBuguer');
    const menu = document.getElementById('idDropDowMenu');

    button.addEventListener('click', function() {
        if (menu.classList.contains('show')) {
            menu.classList.remove('show');
        } else {
            menu.classList.add('show');
        }
    });

    const form = document.getElementById('formEditarProduto');

    function preencherFormularioComProduto(produto) {
        document.getElementById('idCodigoDoProduto').value = produto.id;
        document.getElementById('idNameProduto').value = produto.nome;
        document.getElementById('Categoria').value = produto.categoria;
        document.getElementById('idUnidadeDeMedida').value = produto.unidadereferencia;
        document.getElementById('idValorDaCompra').value = produto.valor;
    }

    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Evita o envio padrão do formulário

        const produtoData = {
            id: produtoId, // O ID obtido da URL será enviado
            nome: document.getElementById('idNameProduto').value,
            categoria: document.getElementById('Categoria').value,
            unidadereferencia: document.getElementById('idUnidadeDeMedida').value,
            valor: document.getElementById('idValorDaCompra').value
        };

        try {
            const response = await fetch(`https://backend-sempre-frutas.onrender.com/atualizarProduto/${produtoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(produtoData)
            });
            console.log(response)
            if (!response.ok) {
                throw new Error('Erro ao atualizar produto');
            }

            const result = await response.json();
            alert('Produto atualizado com sucesso!');
            
            // Fecha a aba após o sucesso
            window.close();

            form.reset(); // Limpa os campos do formulário após sucesso
        } catch (error) {
            console.error('Erro:', error);
            alert('Falha ao atualizar produto');
        }
    });
});

const userLogado = localStorage.getItem('userLogado');
let logado = document.querySelector('.nomeLogado');

logado.innerHTML = `Bem vindo ${userLogado}`;

if(localStorage.getItem('tipodeusuario') == 'caixa') {
        alert('Você não acesso a essa pagina!');
        window.location.href = './home.html';
    }

    if(localStorage.getItem('tipodeusuario') == 'caixa') {
        alert('Você não acesso a essa pagina!');
        window.location.href = './home.html';
    }

function sair() {
    window.location.href = '/index.html';
    localStorage.removeItem('token');
    localStorage.removeItem('userLogado');
    localStorage.removeItem('tipodeusuario');
}