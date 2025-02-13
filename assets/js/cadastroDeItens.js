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
    
    // Seleciona todos os inputs do grupo
    const radios = document.querySelectorAll('input[name="opcaocadastro"]');
    const quantidadeMinima = document.getElementById('idQuantidadeMinima');
    const valorPromocao = document.getElementById('idValorPromocao');

    // Função para aplicar lógica com base no radio selecionado
    function atualizarEstado() {
        const selecionado = document.querySelector('input[name="opcaocadastro"]:checked').value;

        if (selecionado === 'Não') {
            // Configurações para "Não"
            quantidadeMinima.removeAttribute("required");
            valorPromocao.removeAttribute("required");
            quantidadeMinima.style.backgroundColor = "#adadad"; // Muda a cor de fundo
            valorPromocao.style.backgroundColor = "#adadad"; // Muda a cor de fundo
            quantidadeMinima.style.pointerEvents = "none"; // Desativa interações
            valorPromocao.style.pointerEvents = "none"; // Desativa interações
            quantidadeMinima.disabled = true; // Desativa o campo
            valorPromocao.disabled = true; // Desativa o campo
        } else {
            // Configurações para "Sim"
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

    // Adiciona o evento 'change' para cada radio
    radios.forEach(radio => {
        radio.addEventListener('change', atualizarEstado);
    });

    // Verifica o estado inicial ao carregar a página
    window.onload = atualizarEstado;


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
                alert('Você não acesso a essa pagina!');
                window.location.href = './home.html';
            }
        }
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error);
        alert('Erro ao conectar com o servidor');

    }

    // Definir a data automaticamente
    function definirDataAtual() {
        const inputData = document.getElementById('idDataDoProduto');
        const dataAtual = new Date();
        const ano = dataAtual.getFullYear();
        const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const dia = String(dataAtual.getDate()).padStart(2, '0');
        inputData.value = `${ano}-${mes}-${dia}`; // Atribui a data no formato YYYY-MM-DD
    }

    definirDataAtual(); // Chama a função para definir a data atual ao carregar a página

    // Definir o código do produto
    async function definirId() {
        const inputId = document.getElementById('idDoProduto');
        const url = 'http://localhost:3333/getId';
        const response = await fetch(url);
        const responseJson = await response.json();
        const ultimoId = responseJson[0].max_id;
        inputId.value = ultimoId + 1; // Incrementa o ID para o próximo produto
    }
    definirId();

    async function definirCodigo() {
        const codigoDoProduto = document.querySelector('#idCodigoDoProduto');
        const gerarCodigo = Math.random().toString(14).substring(8)
        codigoDoProduto.value = gerarCodigo;
    }
    definirCodigo();

    // Interceptar o envio do formulário para enviar dados via fetch
    const form = document.getElementById('formCadastro');
    form.addEventListener('submit', async function (event) {
        event.preventDefault(); // Previne o envio tradicional do formulário

        // Coletar os dados do formulário
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        console.log(data);

        // Enviar os dados para a API
        try {
            const response = await fetch('http://localhost:3333/cadastroDeItem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                // Limpar o formulário após o sucesso
                form.reset();
                mensagem.innerHTML = 'Produto cadastrado com sucesso!';
                divMensagem.style.display = 'flex';

                // Oculta a mensagem após 5 segundos
                setTimeout(() => {
                    divMensagem.style.display = 'none';
                }, 3000);

                definirId(); // Atualiza o ID do produto
                definirDataAtual(); // Atualiza a data no campo
                definirCodigo();
            } else if(response.status === 400) {
                mensagem.innerHTML = 'Codigo já cadastrado!';

                divMensagem.style.display = 'flex';
                mensagem.style.color = '#d68d8d'
                divMensagem.style.backgroundColor = '#f2dede'; // Altere para a cor desejada
                divMensagem.style.borderColor = '#d68d8d'; // Altere para a cor da borda desejada

                definirCodigo();
                setTimeout(() => {
                    divMensagem.style.display = 'none';
                    mensagem.style.color = '#04750ad0'
                    divMensagem.style.backgroundColor = '#acd3aed0'; // Altere para a cor desejada
                    divMensagem.style.borderColor = '#06570ad0'; // Altere para a cor da borda desejada
                }, 3000);
            } else {
                mensagem.innerHTML = 'Erro ao Cadastra o Produto';

                divMensagem.style.display = 'flex';
                mensagem.style.color = '#d68d8d'
                divMensagem.style.backgroundColor = '#f2dede'; // Altere para a cor desejada
                divMensagem.style.borderColor = '#d68d8d'; // Altere para a cor da borda desejada

                setTimeout(() => {
                    divMensagem.style.display = 'none';
                    mensagem.style.color = '#04750ad0'
                    divMensagem.style.backgroundColor = '#acd3aed0'; // Altere para a cor desejada
                    divMensagem.style.borderColor = '#06570ad0'; // Altere para a cor da borda desejada
                }, 3000);
            }
        } catch (error) {
            console.error('Erro ao conectar com a API:', error);
        }
    });
});

function sair() {
    window.location.href = '/index.html';
    localStorage.removeItem('token');
    localStorage.removeItem('userLogado');
    localStorage.removeItem('tipodeusuario');
}