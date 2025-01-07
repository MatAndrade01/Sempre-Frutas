import mysql from 'mysql2';

// Configuração de conexão
export const client = mysql.createConnection({
  host: 'srv1526.hstgr.io',
  user: 'u673416921_semprefrutas',
  password: 'Semprefrutas00@',
  database: 'u673416921_sempre_frutas',
});

// Conectando ao banco de dados
client.connect((err) => {    
    if (err) {
        console.error('Erro ao conectar ao banco de dados: ' + err.stack);
        return;
    }
    console.log('Conexão bem-sucedida ao banco de dados');
});

// Remover o client.end() aqui, a não ser que você queira explicitamente fechar a conexão.
