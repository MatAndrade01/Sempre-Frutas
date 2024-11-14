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

    // Função para calcular o valor total
    document.addEventListener("DOMContentLoaded", function() {
        const quantidadeInput = document.getElementById("idQuantidade");
        const valorCompraInput = document.getElementById("idValorDaCompra");
        const valorTotalInput = document.getElementById("idValorTotal");

        const calcularValorTotal = () => {
            const quantidade = parseFloat(quantidadeInput.value) || 0;
            const valorCompra = parseFloat(valorCompraInput.value) || 0;
            const valorTotal = quantidade * valorCompra;
            valorTotalInput.value = valorTotal.toFixed(2);
        };

        quantidadeInput.addEventListener("input", calcularValorTotal);
        valorCompraInput.addEventListener("input", calcularValorTotal);
    });
    
    // Chama a função ao carregar a página para definir a data atual
    window.onload = definirDataAtual;

     // Interceptar o envio do formulário para enviar dados via fetch
     const form = document.getElementById('formEntrada');
     form.addEventListener('submit', async function(event) {
         event.preventDefault(); // Previne o envio tradicional do formulário
 
         // Coletar os dados do formulário
         const formData = new FormData(form);
         const data = Object.fromEntries(formData.entries());
 
         // Enviar os dados para a API
         try {
             const response = await fetch('http://localhost:3333/entradaDeItems', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(data),
             });
 
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
