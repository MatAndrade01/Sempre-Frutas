document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form');
    
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Evita o comportamento padrão de envio do formulário

        const username = document.getElementById('idUser').value;
        const password = document.getElementById('idPassword').value;

        // Simulando um login simples com dados fixos
        const validUsername = 'admin';
        const validPassword = 'teste123';

        if (username === validUsername && password === validPassword) {
            // Redirecionar para outra página ou executar alguma ação
            window.location.href = '/pages/home.html'; // Exemplo de redirecionamento
        } else {
            alert('Usuário ou senha incorretos. Tente novamente.');
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