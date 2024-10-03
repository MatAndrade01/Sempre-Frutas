import { parentPort } from "worker_threads";

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


