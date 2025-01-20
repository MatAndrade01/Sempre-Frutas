document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form');
    const divMensagemErro = document.getElementById('divMensagemErro'); // Corrigido o ID
    const mensagemErro = document.getElementById('mensagemErro');
    const inputUser = document.getElementById('idUser');

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // Evita o comportamento padrão do formulário

        const username = inputUser.value;
        const password = document.getElementById('idPassword').value;

        try {
            const response = await fetch('https://backend-sempre-frutas.onrender.com/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ login: username, senha: password }),
            });

            if (!response.ok) {
                throw new Error('Usuário ou senha incorretos');
            }

            const data = await response.json();
            console.log(data);

            // Sucesso no login
            window.location.href = 'http://127.0.0.1:5501/pages/home.html';

            // Simula o armazenamento de token e informações do usuário
            const token = data.token || Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2);
            localStorage.setItem('token', token);
            localStorage.setItem('userLogado', data.login || username);
            localStorage.setItem('tipodeusuario', data.tipodeusuario);
        } catch (error) {
            // Exibe mensagem de erro
            mensagemErro.innerHTML = error.message;
            divMensagemErro.style.display = 'flex'; // Exibe a div com display: flex
            inputUser.focus();

            // Oculta a mensagem após 5 segundos
            setTimeout(() => {
                divMensagemErro.style.display = 'none';
            }, 4000);
        }
    });

    // Lógica para alternar visibilidade da senha
    const passwordInput = document.getElementById('idPassword');
    const togglePassword = document.getElementById('eyeIcon');

    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        this.querySelector('img').src = type === 'password'
            ? '/assets/image/icon/eyeIconClose.svg'
            : '/assets/image/icon/eyeIconOpen.svg';
    });
});
