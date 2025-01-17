document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('idButtonBuguer');
    const menu = document.getElementById('idDropDowMenu');
  
    button.addEventListener('click', function() {
        // Verifica se o menu está visível
        if (menu.classList.contains('show')) {
            menu.classList.remove('show'); // Oculta o menu
        } else {
            menu.classList.add('show'); // Mostra o menu
        }
    });
    

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
        const inputId = document.getElementById('idCodigoDoProduto');
        const url = 'https://semprefrutasapi.shop/getId';
        const response = await fetch(url);
        const responseJson = await response.json();
        const ultimoId = responseJson[0].max_id;
        inputId.value = ultimoId + 1; // Incrementa o ID para o próximo produto
    }
    definirId();

    // Interceptar o envio do formulário para enviar dados via fetch
    const form = document.getElementById('formCadastro');
    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Previne o envio tradicional do formulário

        // Coletar os dados do formulário
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Enviar os dados para a API
        try {
            const response = await fetch('https://semprefrutasapi.shop/cadastroDeItem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                // Limpar o formulário após o sucesso
                form.reset();
                alert('Produto cadastrado com sucesso!');
                definirId(); // Atualiza o ID do produto
                definirDataAtual(); // Atualiza a data no campo
            } else {
                alert('Erro ao cadastrar o produto');
            }
        } catch (error) {
            console.error('Erro ao conectar com a API:', error);
        }
    });
});
