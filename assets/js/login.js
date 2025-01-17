document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form');
    
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Evita o comportamento padrão de envio do formulário

        const username = document.getElementById('idUser').value;
        const password = document.getElementById('idPassword').value;
        const userLabel = document.getElementById('userLabel');
        const inputUser = document.getElementById('idUser');
        const passwordLabel = document.getElementById('passwordLabel');
        const inputPassword = document.getElementById('idPassword');
        const mensagemError = document.getElementById('mensagem');

        // Simulando um login simples com dados fixos
        const validUsername = 'admin';
        const validPassword = 'admin';

        if (username === validUsername && password === validPassword) {
            window.location.href = '/pages/home.html';

            
        } else {
            mensagemError.setAttribute('style', 'display: block');
            mensagemError.innerHTML = 'Usuario ou senha incorretos'
            inputUser.focus();
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('idPassword');
    const togglePassword = document.getElementById('eyeIcon');

    togglePassword.addEventListener('click', function() {
        // Verifica o tipo atual do input de senha
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Alterna a imagem do ícone (opcional, se você tiver diferentes imagens para mostrar/ocultar)
        this.querySelector('img').src = type === 'password' 
            ? '/assets/image/icon/eyeIconClose.svg'  // Ícone de "olho fechado"
            : '/assets/image/icon/eyeIconOpen.svg'; // Ícone de "olho aberto"
    });
});