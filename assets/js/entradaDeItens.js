document.addEventListener('DOMContentLoaded', function() {
    // Função para verificar o tipo de entrada selecionado
    function verificarSelect() {
        const getQuantidadePorCaixa = document.querySelector('#idQuantidadePorCaixa');
        const getLabelQuantidadePorCaixa = document.querySelector('#idLabelQuantidadePorCaixa')
        const getLabelQuantidade = document.querySelector('#idLabelQuantidade');
        const getValorTipoDeEntrada = document.querySelector('#idTipoDeEntrada').value;
    
        if (getValorTipoDeEntrada === "unidade") {
            getQuantidadePorCaixa.readOnly = true; // Torna o campo somente leitura
            getQuantidadePorCaixa.style.pointerEvents = 'none';
            getQuantidadePorCaixa.removeAttribute("required")
            getLabelQuantidadePorCaixa.style.pointerEvents = 'none';
            getQuantidadePorCaixa.style.backgroundColor = '#adadad'; // Muda a cor de fundo
            getLabelQuantidade.innerHTML = 'Quantidade(UN)'
        } else {
            getQuantidadePorCaixa.disabled = false; // Habilita o campo se a condição não for atendida
            getQuantidadePorCaixa.style.backgroundColor = ''; // Reseta a cor de fundo
            getQuantidadePorCaixa.style.visibility = 'visible'; // Torna o campo visível novamente
            getLabelQuantidade.innerHTML = 'Quantidade De Caixas'
        }
    }

    // Adiciona um evento ao campo tipoDeEntrada para verificar a opção selecionada
    document.getElementById('idTipoDeEntrada').addEventListener('change', verificarSelect);

    // Chama a função verificarSelect ao carregar a página
    verificarSelect();

    const button = document.getElementById('idButtonBuguer');
    const menu = document.getElementById('idDropDowMenu');
  
    // Função para alternar visibilidade do menu
    button.addEventListener('click', function() {
        if (menu.classList.contains('show')) {
            menu.classList.remove('show'); // Oculta o menu
        } else {
            menu.classList.add('show'); // Mostra o menu
        }
    });

    // Função para definir a data atual no input
    function definirDataAtual() {
        const inputData = document.getElementById('idInputDate');
        const dataAtual = new Date();
        const ano = dataAtual.getFullYear();
        const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const dia = String(dataAtual.getDate()).padStart(2, '0');
        const dataFormatada = `${ano}-${mes}-${dia}`;
        inputData.value = dataFormatada;
    }

    // Chama a função para definir a data atual ao carregar a página
    definirDataAtual();

    // Interceptar o envio do formulário para enviar dados via fetch
    const form = document.getElementById('formEntrada');
    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Previne o envio tradicional do formulário

        // Coletar os dados do formulário
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        console.log(data); // Exibe os dados coletados no console para depuração


        // Verifica se 'quantidadeporcaixa' está vazio ou nulo e substitui por 0
        if (!data.quantidadeporcaixa || data.quantidadeporcaixa === "") {
            data.quantidadeporcaixa = "0";
        }

        // Enviar os dados para a API
        try {
            const response = await fetch('http://localhost:3333/entradaDeItems', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            console.log(response.body)

            if (response.ok) {
                // Limpar o formulário após o sucesso
                form.reset();
                alert('Entrada feita com sucesso!');
                definirDataAtual(); // Atualiza a data no campo
            } else {
                alert('Erro ao dar entrada no produto');
            }
        } catch (error) {
            console.error('Erro ao conectar com a API:', error);
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
            valorTotal = quantidadeValor * valorCompra;
        } 
        // Se a entrada for por "caixa", faz o cálculo baseado na quantidade por caixa
        else if (tipoDeEntrada === "caixa") {
            valorTotal = (quantidadeValor * valorCompra);
        }

        valorTotalInput.value = valorTotal.toFixed(2); // Exibe o valor total no campo
    }

    // Adiciona os ouvintes de eventos para calcular o valor total
    const quantidadeInput = document.getElementById("idQuantidade");
    const valorCompraInput = document.getElementById("idValorDaCompra");
    quantidadeInput.addEventListener("input", calcularValorTotal);
    valorCompraInput.addEventListener("input", calcularValorTotal);
    document.getElementById("idQuantidadePorCaixa").addEventListener("input", calcularValorTotal);
});
