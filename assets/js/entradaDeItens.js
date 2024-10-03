//import { parentPort } from "worker_threads";

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
});

// Função para definir a data atual no input
function definirDataAtual() {
    const inputData = document.getElementById('idInputDate');
    const dataAtual = new Date();
    
    // Formata a data no formato YYYY-MM-DD
    const ano = dataAtual.getFullYear();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0'); // Meses começam em 0
    const dia = String(dataAtual.getDate()).padStart(2, '0');
    
    const dataFormatada = `${ano}-${mes}-${dia}`;
    inputData.value = dataFormatada; // Atribui a data formatada ao input
}

// Chama a função ao carregar a página
window.onload = definirDataAtual;

document.addEventListener("DOMContentLoaded", function() {
    const quantidadeInput = document.getElementById("idQuantidade");
    const valorCompraInput = document.getElementById("idValorDaCompra");
    const valorTotalInput = document.getElementById("idValorTotal");

    const calcularValorTotal = () => {
        const quantidade = parseFloat(quantidadeInput.value) || 0; // Converte para número ou 0
        const valorCompra = parseFloat(valorCompraInput.value) || 0; // Converte para número ou 0
        const valorTotal = quantidade * valorCompra;
        valorTotalInput.value = valorTotal.toFixed(2); // Atualiza o valor total com 2 casas decimais
    };

    // Adiciona ouvintes de eventos para atualizar o valor total
    quantidadeInput.addEventListener("input", calcularValorTotal);
    valorCompraInput.addEventListener("input", calcularValorTotal);
});

fetch('http://localhost:3333/teste').then(response =>{
    return response.json()
}).then(response =>{ console.log(response)})

const formulario = document.getElementById('formEntrada')
const formData = new FormData(formulario)
formulario.addEventListener('submit', async()=>{
    Event.preventDefault()
  
    const arrayInput = document.querySelectorAll('.inputEntrada')
    let nfrecibo = await arrayInput[0].value
    let quantidade = await arrayInput[5].value
    let valorcompra = await arrayInput[6].value
    let nome = await arrayInput[3].value
    let fornecedor = await arrayInput[4].value

    await fetch('/entradaDeItems',{
        method:'POST',
        headers:{
            "Content-Type": "application/json",
        },
        
    }).then(resolve =>{console.log(resolve)}).catch(error =>{console.log(error)})
})


console.log('ok')