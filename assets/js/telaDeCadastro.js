//Menu Hamburguer

const menuHamburguer = document.querySelector('#btn')
const secaoDeItensHamburguer = document.querySelector('.secaoDeItensHamburguer')
const divMenuHamburguer = document.querySelector('.menuHamburguer')
menuHamburguer.addEventListener('click',()=>{
  secaoDeItensHamburguer.classList.toggle('ativo')
  divMenuHamburguer.classList.toggle('ativo1')
})