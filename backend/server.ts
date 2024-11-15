import fastify from 'fastify';
import { client } from './_database.ts';
import { z } from 'zod';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import { request } from 'http';

const server = fastify();
await server.register(cors);
await server.register(formbody);

client.connect();

// Endpoint para listar produtos cadastrados
server.get('/produtosCadastrado', async (request, reply) => {
    const createEventSchema = z.object({
        nomepesquisa: z.string().optional(), // Nome do produto para pesquisa
    });

    const { nomepesquisa } = createEventSchema.parse(request.query);

    if (nomepesquisa) {
        const result = await client.query('SELECT * FROM produtos WHERE nome = $1', [nomepesquisa.toUpperCase()]);
        return result.rows;
    } else {
        const result = await client.query('SELECT * FROM produtos');
        return result.rows;
    }
});


server.get('/estoque', async (request, reply) => {
    const createEventSchema = z.object({
        codigo: z.string().optional(),
        nomePesquisa: z.string().optional(),
    });

    const {codigo, nomePesquisa} = createEventSchema.parse(request.query);

    if(codigo) {
        const result = await client.query('SELECT * FROM estoque WHERE id = $1', [codigo]);
        return result.rows;
    } else {
        const result = await client.query('SELECT * FROM estoque');
        return result.rows;
    }
});

// Endpoint para obter o ID máximo na tabela produtos
server.get('/getId', async (request, reply) => {
    const getAll = await client.query('SELECT MAX(id) FROM produtos');
    return getAll.rows;
});

// Endpoint para registrar a entrada de itens no estoque
server.post('/entradaDeItems', async (request, reply) => {
    // Ajuste do schema para não exigir o campo fornecedor
    const createEventSchema = z.object({
        nfrecibo: z.string().nullable(),
        quantidade: z.string().min(1).nullable(),
        valorcompra: z.string().min(1).nullable(),
        nome: z.string().nullable(),
        // fornecedor foi removido aqui
    });

    // Parse dos dados da requisição
    const data = createEventSchema.parse(request.body);
    const nameUper = data.nome?.toUpperCase();

    // Verificação no banco para a quantidade do produto
    const productResult = await client.query(
        'SELECT quantidadedoproduto FROM estoque WHERE nomedoproduto = $1',
        [nameUper]
    );

    // Verificação do nome do produto no estoque
    const nomeProdutoEstoque = await client.query(
        'SELECT nomedoproduto FROM estoque WHERE nomedoproduto = $1',
        [nameUper]
    );

    // Se o produto existir no estoque e a quantidade for informada
    if (nomeProdutoEstoque.rows[0]?.nomedoproduto === nameUper && data.quantidade) {
        const existingQuantity = productResult.rows[0].quantidadedoproduto;
        const newQuantity = parseInt(existingQuantity) + parseInt(data.quantidade);

        try {
            // Inserir na tabela de entrada (removendo fornecedor)
            await client.query(
                'INSERT INTO entrada (nfrecibo, quantidade, valorcompra, nome) VALUES ($1, $2, $3, $4) RETURNING *',
                [data.nfrecibo, data.quantidade, data.valorcompra, data.nome]
            );

            await client.query(
                'INSERT INTO relatorio (nomedoproduto, valor, tipo, quantidade) VALUES ($1, $2, $3, $4) RETURNING *',
                [data.nome, data.valorcompra, 'ENTADA', data.quantidade ]
            );

            // Atualizar a quantidade no estoque
            await client.query(
                'UPDATE estoque SET quantidadedoproduto = $1 WHERE nomedoproduto = $2',
                [newQuantity, nameUper]
            );

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


// Endpoint para cadastro de novo item
server.post('/cadastroDeItem', async (request, reply) => {
    const createEventSchema = z.object({
        nome: z.string().min(1).nullable(),
        valor: z.string().min(1).nullable(),
        unidadereferencia: z.string().min(1).nullable(),
        categoria: z.string().min(1).nullable(),
        fornecedor: z.string().min(1).nullable(),
    });

    const data = createEventSchema.parse(request.body);

    const getNomeProdutoCadastrado = await client.query('SELECT * FROM produtos WHERE nome = $1', [data.nome?.toUpperCase()]);

    if (getNomeProdutoCadastrado.rowCount) {
        for (let i = 0; i < getNomeProdutoCadastrado.rowCount; i++) {
            if (data.nome?.toUpperCase() === getNomeProdutoCadastrado.rows[i].nome) {
                return reply.status(400).send({ message: 'Item já cadastrado' });
            }
        }
    }

    const result = await client.query(
        'INSERT INTO produtos (nome, valor, unidadereferencia, categoria, fornecedor) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [data.nome?.toUpperCase(), data.valor, data.unidadereferencia?.toUpperCase(), data.categoria?.toUpperCase(), data.fornecedor?.toUpperCase()]
    );

    await client.query(
        'INSERT INTO estoque (nomedoproduto, quantidadedoproduto, unidadedereferencia, fornecedor, categoria, valordevenda) VALUES ($1, 0, $2, $3, $4, $5)',
        [data.nome?.toUpperCase(), data.unidadereferencia?.toUpperCase(), data.fornecedor?.toUpperCase(), data.categoria?.toUpperCase(), data.valor?.toUpperCase()]
    );

    // Enviar resposta mínima
    return reply.status(201).send({ message: 'Produto cadastrado com sucesso' });
});

// Inicializando o servidor
server.listen({ port: 3333 }).then(() => {
    console.log('Servidor funcionando na porta 3333');
});
