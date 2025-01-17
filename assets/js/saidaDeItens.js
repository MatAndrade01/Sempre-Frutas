document.addEventListener('DOMContentLoaded', function () {
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
    
    const nomeProdutoInput = document.getElementById('idNomeDoProduto'); // Campo de nome do produto
    const quantidadeInput = document.getElementById('idQuantidadeSaida'); // Campo de quantidade
    const valorTotalInput = document.getElementById('idValorDaSaida'); // Campo de valor total
    const urlBase = 'https://semprefrutasapi.shop/produtosCadastrado'; // Base URL para a API
    
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
            console.error('Erro ao buscar os produtos:', error);
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
    nomeProdutoInput.addEventListener('input', fetchValorDaVenda);
    
    // Adiciona um listener para recalcular o valor total quando a quantidade for alterada
    quantidadeInput.addEventListener('input', calcularValorTotal);

    // Função para definir a data atual no input de data
    function definirDataAtual() {
        const inputData = document.getElementById('idDataSaida');
        if (inputData) {
            const dataAtual = new Date();
            const ano = dataAtual.getFullYear();
            const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
            const dia = String(dataAtual.getDate()).padStart(2, '0');
            const dataFormatada = `${ano}-${mes}-${dia}`;
            inputData.value = dataFormatada;
        } else {
            console.error('Elemento de input de data não encontrado');
        }
    }

    // Chama a função para definir a data atual no campo de data
    definirDataAtual();

    document.getElementById('formSainda').addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o recarregamento da página
    
        const nome = document.getElementById('idNomeDoProduto').value.trim();
        const quantidade = parseInt(document.getElementById('idQuantidadeSaida').value);
        const tipoSaida = document.getElementById('idTipoDeSaida').value;
        const valorDaSaida = parseFloat(document.getElementById('idValorDaSaida').value); // Convertendo para número
    
        // Verificando se os campos são válidos
        if (!nome || !quantidade || quantidade <= 0 || isNaN(valorDaSaida)) {
            alert('Preencha todos os campos corretamente.');
            return;
        }
    
        try {
            const response = await fetch('https://semprefrutasapi.shop/saidaDeItem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome, quantidade, tipoSaida, valorDaSaida }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert('Saída registrada com sucesso!');
                // Limpar os campos do formulário
                document.getElementById('formSainda').reset();
            } else {
                console.log(data.message);
                alert(`Erro: ${data.message}`);
            }
        } catch (error) {
            console.error('Erro ao enviar saída:', error);
            alert('Erro ao processar a saída.');
        }
    });
    
    
});
