const inputSearch = document.querySelector('.quantidade')
const arrayText = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","U","V","W","X","Y","Z"];
inputSearch.addEventListener('keypress', function(e){
  arrayText.forEach((item)=>{
    if(e.key === item)
    e.preventDefault()
  })
})

//Menu Hamburguer

const menuHamburguer = document.querySelector('#btn')
const secaoDeItensHamburguer = document.querySelector('.secaoDeItensHamburguer')
const divMenuHamburguer = document.querySelector('.menuHamburguer')
menuHamburguer.addEventListener('click',()=>{
  secaoDeItensHamburguer.classList.toggle('ativo')
  divMenuHamburguer.classList.toggle('ativo1')
})