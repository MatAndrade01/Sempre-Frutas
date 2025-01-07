import fastify from 'fastify';
import { FastifyRequest } from 'fastify';
import mysql from 'mysql2';
import { z } from 'zod';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';

// Create MySQL connection pool
const pool = mysql.createPool({
  host: 'srv1526.hstgr.io',
  user: 'u673416921_semprefrutas',
  password: 'Semprefrutas00@',
  database: 'u673416921_sempre_frutas',
});

// Using promise-based connection for MySQL
const promisePool = pool.promise();

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    process.exit(1);  // Exit process if connection fails
  } else {
    console.log('Conexão bem-sucedida com o banco de dados MySQL');
    connection.release();  // Release the connection after test
  }
});

const server = fastify();
await server.register(cors);
await server.register(formbody);

// Endpoint to list registered products
server.get('/produtosCadastrado', async (request, reply) => {
  const createEventSchema = z.object({
    nomepesquisa: z.string().optional(), // Product name for search
  });

  const { nomepesquisa } = createEventSchema.parse(request.query);

  if (nomepesquisa) {
    const [rows] = await promisePool.query('SELECT * FROM produtos WHERE nome = ?', [nomepesquisa.toUpperCase()]);
    return Array.isArray(rows) ? rows : [];
  } else {
    const [rows] = await promisePool.query('SELECT * FROM produtos');
    return Array.isArray(rows) ? rows : [];
  }
});

// Endpoint for stock details
server.get('/estoque', async (request, reply) => {
  const createEventSchema = z.object({
    nomePesquisa: z.string().optional(),
  });

  const { nomePesquisa } = createEventSchema.parse(request.query);

  if (nomePesquisa) {
    const [rows] = await promisePool.query('SELECT * FROM estoque WHERE nomedoproduto = ?', [nomePesquisa]);
    return Array.isArray(rows) ? rows : [];
  } else {
    const [rows] = await promisePool.query('SELECT * FROM estoque');
    return Array.isArray(rows) ? rows : [];
  }
});

// Endpoint to get max ID in products table
server.get('/getId', async (request, reply) => {
  const [rows] = await promisePool.query('SELECT MAX(id) AS max_id FROM produtos');
  return Array.isArray(rows) ? rows : [];
});

// Endpoint to register new item entry
server.post('/entradaDeItems', async (request, reply) => {
  const createEventSchema = z.object({
    quantidade: z.string().min(1).nullable(),
    valorcompra: z.string().min(1).nullable(),
    valortotal: z.string(),
    nome: z.string().nullable(),
    tipodeentrada: z.string(),
    quantidadeporcaixa: z.string().nullable(),
  });

  const data = createEventSchema.parse(request.body);
  const nameUper = data.nome?.toUpperCase();

  const [productResult] = await promisePool.query(
    'SELECT quantidadedoproduto FROM estoque WHERE nomedoproduto = ?',
    [nameUper]
  );

  const [nomeProdutoEstoque] = await promisePool.query(
    'SELECT nomedoproduto FROM estoque WHERE nomedoproduto = ?',
    [nameUper]
  );

  const nomeProdutoEstoqueResult = nomeProdutoEstoque as mysql.RowDataPacket[];
  const productResultData = productResult as mysql.RowDataPacket[];

  if (nomeProdutoEstoqueResult[0]?.nomedoproduto === nameUper && data.quantidade && data.quantidadeporcaixa) {
    const existingQuantity = productResultData[0].quantidadedoproduto;
    let newQuantity = 0;
    const quantityBox = parseInt(data.quantidade) * parseInt(data.quantidadeporcaixa);

    try {
      if (data.tipodeentrada === 'caixa') {
        newQuantity = parseInt(existingQuantity) + quantityBox;

        await promisePool.query(
          'INSERT INTO entrada (quantidade, valordecompra, nome, tipodeentrada, quantidadeporcaixa, valortotal) VALUES (?, ?, ?, ?, ?, ?)',
          [quantityBox, data.valorcompra, nameUper, data.tipodeentrada, data.quantidadeporcaixa, data.valortotal]
        );

        await promisePool.query(
          'INSERT INTO relatorio (nomedoproduto, valor, tipodemovimento, quantidade, tipodecompra, formadepagamento) VALUES (?, ?, ?, ?, ?, ?)',
          [nameUper, data.valorcompra, 'ENTRADA DE CAIXA', quantityBox, "NAO FOI COMPRA", "NAO FOI COMPRA"]
        );

        await promisePool.query(
          'UPDATE estoque SET quantidadedoproduto = ? WHERE nomedoproduto = ?',
          [newQuantity, nameUper]
        );
      } else if (data.tipodeentrada === 'unidade') {
        newQuantity = parseInt(existingQuantity) + parseInt(data.quantidade);

        await promisePool.query(
          'INSERT INTO entrada (quantidade, valordecompra, nome, tipodeentrada, quantidadeporcaixa, valortotal) VALUES (?, ?, ?, ?, ?, ?)',
          [data.quantidade, data.valorcompra, nameUper, data.tipodeentrada, data.quantidadeporcaixa, data.valortotal]
        );

        await promisePool.query(
          'INSERT INTO relatorio (nomedoproduto, valor, tipodemovimento, quantidade, tipodecompra) VALUES (?, ?, ?, ?, ?)',
          [nameUper, data.valorcompra, 'ENTRADA DE UNIDADE', data.quantidade, "NAO FOI COMPRA"]
        );

        await promisePool.query(
          'UPDATE estoque SET quantidadedoproduto = ? WHERE nomedoproduto = ?',
          [newQuantity, nameUper]
        );
      }

      console.log(`Estoque atualizado para o produto ${data.nome}: ${newQuantity} unidades.`);
      reply.status(200).send({ message: `Estoque atualizado para o produto ${data.nome}` });
    } catch (err) {
      console.error('Erro ao atualizar o estoque:', err);
      reply.status(500).send({ message: 'Erro interno ao atualizar o estoque.' });
    }
  } else {
    console.log(`Produto ${data.nome} não encontrado no estoque. Não é possível dar entrada.`);
    reply.status(400).send({ message: `Produto ${data.nome} não encontrado no estoque. Não é possível dar entrada.` });
  }
});

server.post('/saidaDeItem', async (request, reply) => {
  const createEventSchema = z.object({
      nome: z.string(),
      quantidade: z.number().min(1),
      tipoSaida: z.string(),
      valorDaSaida: z.number(),
  });

  try {
      const { nome, quantidade, tipoSaida, valorDaSaida } = createEventSchema.parse(request.body);

      const nomeProduto = nome.toUpperCase();

      // Verificar se o produto existe no estoque
      const [result] = await promisePool.query(
          'SELECT quantidadedoproduto FROM estoque WHERE nomedoproduto = ?',
          [nomeProduto]
      );

      const rows = result as mysql.RowDataPacket[];
      if (rows.length === 0) {
          return reply.status(404).send({ message: 'Produto não encontrado no estoque.' });
      }

      const stockRows = result as mysql.RowDataPacket[];
      const quantidadeAtual = parseInt(rows[0].quantidadedoproduto, 10);
      const novaQuantidade = quantidadeAtual - quantidade;

      if (novaQuantidade < 0) {
          return reply.status(400).send({ message: 'Quantidade insuficiente no estoque.' });
      }

      // Atualizar a quantidade no estoque
      await promisePool.query(
          'UPDATE estoque SET quantidadedoproduto = ? WHERE nomedoproduto = ?',
          [novaQuantidade, nomeProduto]
      );

      // Registrar a saída no relatório
      await promisePool.query(
          'INSERT INTO relatorio (nomedoproduto, valor, tipodemovimento, quantidade, tipodecompra, formadepagamento) VALUES (?, ?, ?, ?, ?, ?)',
          [nomeProduto, valorDaSaida, tipoSaida, quantidade, "NAO FOI COMPRA", "NAO FOI   COMPRA"]
      );

      return reply.status(200).send({ message: 'Saída registrada com sucesso.' });
  } catch (error) {
      if (error instanceof Error) {
          return reply.status(500).send({ message: `Erro ao registrar saída de item: ${error.message}` });
      } else {
          console.error('Erro desconhecido ao registrar saída de item');
          return reply.status(500).send({ message: 'Erro desconhecido ao registrar saída de item.' });
      }
  }
});


// Endpoint to register a new item
server.post('/cadastroDeItem', async (request, reply) => {
  const createEventSchema = z.object({
    nome: z.string().min(1).nullable(),
    valor: z.string().min(1).nullable(),
    unidadereferencia: z.string().min(1).nullable(),
    categoria: z.string().min(1).nullable(),
  });

  const data = createEventSchema.parse(request.body);

  const [getNomeProdutoCadastrado] = await promisePool.query('SELECT * FROM produtos WHERE nome = ?', [data.nome?.toUpperCase()]);

  if (Array.isArray(getNomeProdutoCadastrado) && getNomeProdutoCadastrado.length > 0) {
    return reply.status(400).send({ message: 'Item já cadastrado' });
  }

  await promisePool.query(
    'INSERT INTO produtos (nome, valor, unidadereferencia, categoria) VALUES (?, ?, ?, ?)',
    [data.nome?.toUpperCase(), data.valor, data.unidadereferencia?.toUpperCase(), data.categoria?.toUpperCase()]
  );

  await promisePool.query(
    'INSERT INTO estoque (nomedoproduto, quantidadedoproduto, unidadedereferencia, categoria, valordevenda) VALUES (?, 0, ?, ?, ?)',
    [data.nome?.toUpperCase(), data.unidadereferencia?.toUpperCase(), data.categoria?.toUpperCase(), data.valor]
  );

  return reply.status(201).send({ message: 'Produto cadastrado com sucesso' });
});

server.get('/relatorio', async (request, reply) => {
  const createEventSchema = z.object({
      nomepesquisa: z.string().optional(),
      datainicial: z.string().optional(),
      datafinal: z.string().optional(),
      tipodemovimentacao: z.string().optional(),
      tipodevenda: z.string().optional(),
      formadepagamento: z.string().optional(),
  });

  // Validando os parâmetros da query string
  const { nomepesquisa, datainicial, datafinal, tipodemovimentacao, tipodevenda, formadepagamento } = createEventSchema.parse(request.query);

  console.log(nomepesquisa); // Verifique o valor de nomepesquisa

  // Transformando nomepesquisa para maiúsculas
  const nomeUper = nomepesquisa ? nomepesquisa.toUpperCase() : nomepesquisa;

  let query = 'SELECT * FROM relatorio WHERE 1=1'; // Base da query
  const values = [];

  // Filtro por nomedoproduto (usando LIKE para busca insensível a maiúsculas/minúsculas)
  if (nomepesquisa) {
      query += ` AND UPPER(TRIM(nomedoproduto)) LIKE ?`; // Usando TRIM e UPPER
      values.push(`%${nomeUper}%`); // Adicionando o valor com nome transformado em maiúsculas
  }

  // Filtro por data inicial
  if (datainicial) {
      query += ` AND DATE(data) >= ?`;
      values.push(datainicial);
  }

  // Filtro por data final
  if (datafinal) {
      query += ` AND DATE(data) <= ?`;
      values.push(datafinal);
  }

  // Filtro por tipo de movimentação
  if (tipodemovimentacao) {
      query += ` AND tipodemovimento = ?`;
      values.push(tipodemovimentacao);
  }

  // Filtro por tipo de venda
  if (tipodevenda) {
      query += ` AND tipodecompra = ?`;
      values.push(tipodevenda);
  }

  // Filtro por forma de pagamento
  if (formadepagamento) {
      query += ` AND formadepagamento = ?`;
      values.push(formadepagamento);
  }

  // Imprime a query e os valores para depuração
  console.log('Query:', query);
  console.log('Values:', values);

  try {
      // Executando a consulta no banco
      const [rows] = await promisePool.query(query, values);

      console.log(rows);
      // Retornando os dados filtrados
      return reply.send(rows);
  } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      return reply.status(500).send({ message: 'Erro ao buscar relatório.' });
  }
});

server.put('/atualizarProduto/:id', async (request, reply) => {
  const { id } = request.params as { id: string }; // Obtendo o ID do produto da URL

  const createEventSchema = z.object({
      nome: z.string().min(1).nullable(),
      valor: z.string().min(1).nullable(),
      unidadereferencia: z.string().min(1).nullable(),
      categoria: z.string().min(1).nullable(),
  });

  try {
      const data = createEventSchema.parse(request.body);

      // Inicia uma transação para garantir que ambas as atualizações (produtos e estoque) sejam feitas de forma segura
      const connection = await promisePool.getConnection();
      await connection.beginTransaction(); // Inicia a transação

      // Atualizando o produto na tabela 'produtos'
      const [resultProduto] = await connection.execute<mysql.ResultSetHeader>(
          `UPDATE produtos
          SET nome = ?, valor = ?, unidadereferencia = ?, categoria = ?
          WHERE id = ?`,
          [
              data.nome?.toUpperCase(),
              data.valor,
              data.unidadereferencia?.toUpperCase(),
              data.categoria?.toUpperCase(),
              id,
          ]
      );

      if (resultProduto.affectedRows === 0) {
          await connection.rollback(); // Desfaz qualquer alteração se o produto não for encontrado
          connection.release();
          return reply.status(404).send({ message: 'Produto não encontrado.' });
      }

      // Atualizando a tabela 'estoque' (caso seja necessário atualizar o estoque junto)
      const [resultEstoque] = await connection.execute<mysql.ResultSetHeader>(
          `UPDATE estoque
          SET nomedoproduto = ?, unidadedereferencia = ?, categoria = ?
          WHERE id = ?`,
          [
              data.nome?.toUpperCase(),
              data.unidadereferencia?.toUpperCase(),
              data.categoria?.toUpperCase(),
              id,
          ]
      );

      if (resultEstoque.affectedRows === 0) {
          await connection.rollback(); // Se o estoque não for atualizado, desfaz as mudanças no produto
          connection.release();
          return reply.status(404).send({ message: 'Produto não encontrado no estoque.' });
      }

      // Se tudo ocorrer bem, comita a transação
      await connection.commit();
      connection.release();
      
      return reply.status(200).send({ message: 'Produto e estoque atualizados com sucesso' });
  } catch (error) {
      console.error('Erro ao atualizar o produto:', error);
      return reply.status(500).send({ message: 'Erro interno ao atualizar o produto.' });
  }
});

server.delete('/deleteProduto/:id', async (request: FastifyRequest, reply) => {
  const { id } = request.params as { id: string };
  console.log('Tentando deletar o produto com ID:', id);

  try {
    // Verificando se o produto existe
    const [produtoResult] = await promisePool.query('SELECT * FROM produtos WHERE id = ?', [id]);
    console.log('Produto encontrado:', produtoResult);

    if (!(produtoResult as mysql.RowDataPacket[]).length) {
      return reply.status(404).send({ message: 'Produto não encontrado.' });
    }

    // Obtendo o nome do produto para verificar no estoque
    const nomeProduto = (produtoResult as mysql.RowDataPacket[])[0].nome;
    console.log('Nome do produto:', nomeProduto);

    const [estoqueResult] = await promisePool.query<mysql.RowDataPacket[]>('SELECT * FROM estoque WHERE nomedoproduto = ?', [nomeProduto]);
    console.log('Produto no estoque:', estoqueResult);

    if (!(estoqueResult as mysql.RowDataPacket[]).length) {
      return reply.status(404).send({ message: 'Produto não encontrado no estoque.' });
    }

    // Deletando do estoque
    await promisePool.query('DELETE FROM estoque WHERE nomedoproduto = ?', [nomeProduto]);

    // Deletando do produto
    await promisePool.query('DELETE FROM produtos WHERE id = ?', [id]);

    return reply.status(200).send({ message: 'Produto excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return reply.status(500).send({ message: 'Erro interno ao excluir o produto.' });
  }
});


server.post('/faturamento', async (request, reply) => {
  // Atualizando o schema para incluir as novas informações
  const createEventSchema = z.object({
    itens: z.array(
      z.object({
        nome: z.string().min(1),
        quantidade: z.number().min(1),
        valor: z.number().min(1),
      })
    ),
    tipodepagamento: z.string(),
    valorpago: z.number().min(1),
    valortotal: z.number().min(1),
    tipodecompra: z.string().min(1)
  });

  try {
    // Validando o corpo da requisição
    const data = createEventSchema.parse(request.body);

    // Acessando os dados do formulário e dos itens
    const { itens, tipodepagamento, valorpago, valortotal, tipodecompra} = data;

    console.log(`Tipo de pagamento: ${tipodepagamento}`);
    console.log(`Valor pago: ${valorpago}`);
    console.log(`Valor total: ${valortotal}`);
    console.log(`Tipo de compra: ${tipodecompra}`);

    // Lógica do faturamento
    const connection = await promisePool.getConnection();
    await connection.beginTransaction(); // Inicia a transação

    for (const item of itens) {
      console.log(`Faturando item: ${item.nome} com a quantidade ${item.quantidade}`);

      // Recuperar informações do estoque (exemplo)
      const [estoqueResult] = await connection.execute(
        'SELECT quantidadedoproduto, valordevenda FROM estoque WHERE nomedoproduto = ?',
        [item.nome]
      );

      const estoqueRows = estoqueResult as mysql.RowDataPacket[];
      if (estoqueRows.length === 0) {
        await connection.rollback(); // Desfaz qualquer alteração em caso de erro
        connection.release();
        reply.status(404).send({ message: `Produto ${item.nome} não encontrado no estoque.` });
        return;
      }

      const produto = (estoqueResult as mysql.RowDataPacket[])[0];
      const novaQuantidade = produto.quantidadedoproduto - item.quantidade;

      // Atualizar a quantidade no estoque
      await connection.execute(
        'UPDATE estoque SET quantidadedoproduto = ? WHERE nomedoproduto = ?',
        [novaQuantidade, item.nome]
      );

      // Registrar a saída no relatório
      await connection.execute(
        'INSERT INTO relatorio (nomedoproduto, tipodemovimento, quantidade, valor, tipodecompra, formadepagamento) VALUES (?, ?, ?, ?, ?, ?)',
        [item.nome, 'VENDA', item.quantidade, item.valor, tipodecompra, tipodepagamento]
      );
    }
    
    // Registrar o faturamento na tabela 'itensfaturados'
    await connection.execute(
      'INSERT INTO itensfaturados (itens, valorpago, valortotal, tipodepagamento) VALUES (?, ?, ?, ?)',
      [JSON.stringify(itens), valorpago, valortotal, tipodepagamento]
    );

    // Finalizar faturamento e enviar a resposta
    await connection.commit(); // Comita a transação
    connection.release();
    
    reply.status(200).send({ message: 'Faturamento realizado com sucesso' });
  } catch (err) {
    console.error('Erro ao faturar:', err);
    reply.status(500).send({ message: 'Erro interno ao faturar' });
  }
});


// Start the Fastify server
const start = async () => {
  try {
    await server.listen({ port: 3333 });
    console.log('Servidor Fastify rodando na porta 3333');
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

start();
