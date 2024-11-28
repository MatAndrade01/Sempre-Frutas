import fastify from 'fastify';
import { client } from './_database.ts';
import { z } from 'zod';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import { request } from 'http';
import { Console } from 'console';

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
        nomePesquisa: z.string().optional(),
    });

    const {nomePesquisa} = createEventSchema.parse(request.query);

    if(nomePesquisa) {
        const result = await client.query('SELECT * FROM estoque WHERE nomedoproduto = $1', [nomePesquisa]);
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
    const createEventSchema = z.object({
        quantidade: z.string().min(1).nullable(),
        valorcompra: z.string().min(1).nullable(),
        valortotal: z.string(),
        nome: z.string().nullable(),
        tipodeentrada: z.string(),
        quantidadeporcaixa: z.string().nullable(),
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
    if (nomeProdutoEstoque.rows[0]?.nomedoproduto === nameUper && data.quantidade && data.quantidadeporcaixa) {
        const existingQuantity = productResult.rows[0].quantidadedoproduto;
        let newQuantity = 0

        const quantityBox = parseInt(data.quantidade) * parseInt(data.quantidadeporcaixa);

        try {
            // Inserir na tabela de entrada se for CAIXA
            if(data.tipodeentrada === 'caixa') {
                
                newQuantity = parseInt(existingQuantity) + quantityBox;

                await client.query(
                    'INSERT INTO entrada ( quantidade, valordecompra, nome, tipodeentrada, quantidadeporcaixa, valortotal) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                    [quantityBox, data.valorcompra, nameUper, data.tipodeentrada, data.   quantidadeporcaixa, data.valortotal]
                );

                await client.query(
                    'INSERT INTO relatorio (nomedoproduto, valor, tipodemovimento, quantidade) VALUES ($1, $2, $3, $4) RETURNING *',
                    [nameUper, data.valorcompra, 'ENTRADA DE CAIXA', quantityBox ]
                );
                // Atualizar a quantidade no estoque
                await client.query(
                    'UPDATE estoque SET quantidadedoproduto = $1 WHERE nomedoproduto = $2',
                    [newQuantity, nameUper]
                );
            } else if (data.tipodeentrada === 'unidade') {

                newQuantity = parseInt(existingQuantity) + parseInt(data.quantidade);

                await client.query(
                    'INSERT INTO entrada ( quantidade, valordecompra, nome, tipodeentrada, quantidadeporcaixa, valortotal) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                    [data.quantidade, data.valorcompra, nameUper, data.tipodeentrada, data.   quantidadeporcaixa, data.valortotal]
                );

                await client.query(
                    'INSERT INTO relatorio (nomedoproduto, valor, tipodemovimento, quantidade) VALUES ($1, $2, $3, $4) RETURNING *',
                    [nameUper, data.valorcompra, 'ENTRADA DE UNIDADE', data.quantidade]
                );

                // Atualizar a quantidade no estoque
                await client.query(
                'UPDATE estoque SET quantidadedoproduto = $1 WHERE nomedoproduto = $2',
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
        const result = await client.query('SELECT quantidadedoproduto FROM estoque WHERE nomedoproduto = $1', [nomeProduto]);

        if (result.rowCount === 0) {
            return reply.status(404).send({ message: 'Produto não encontrado no estoque.' });
        }

        const quantidadeAtual = parseInt(result.rows[0].quantidadedoproduto);
        const novaQuantidade = quantidadeAtual - quantidade;

        if (novaQuantidade < 0) {
            return reply.status(400).send({ message: 'Quantidade insuficiente no estoque.' });
        }

        // Atualizar a quantidade no estoque
        await client.query('UPDATE estoque SET quantidadedoproduto = $1 WHERE nomedoproduto = $2', [novaQuantidade, nomeProduto]);

        // Registrar a saída no relatório
        await client.query(
            'INSERT INTO relatorio (nomedoproduto, valor, tipodemovimento, quantidade) VALUES ($1, $2, $3, $4)',
            [nomeProduto, valorDaSaida, tipoSaida, quantidade]
        );

        return reply.status(200).send({ message: 'Saída registrada com sucesso.' });
    } catch (error: unknown) {  // Agora o tipo do erro é 'unknown'
        if (error instanceof Error) {
            
            return reply.status(500).send({ message: `Erro ao registrar saída de item: ${error.message}` });
        } else {
            console.error('Erro desconhecido ao registrar saída de item');
            return reply.status(500).send({ message: 'Erro desconhecido ao registrar saída de item.' });
        }
    }
});

server.get('/relatorio', async (request, reply) => {
    const createEventSchema = z.object({
        nomepesquisa: z.string().optional(),
        datainicial: z.string().optional(),
        datafinal: z.string().optional()
    });

    const { nomepesquisa, datainicial, datafinal } = createEventSchema.parse(request.query);

    // Transformando nomepesquisa para maiúsculas
    const nomeUper = nomepesquisa ? nomepesquisa.toUpperCase() : nomepesquisa;

    let query = 'SELECT * FROM relatorio WHERE 1=1'; // Base da query
    const values = [];

    // Filtro por nome (comparando o nome)
    3

    // Filtro por data inicial (comparando apenas a data)
    if (datainicial) {
        query += ` AND data::DATE >= $${values.length + 1}`;
        values.push(datainicial);
    }

    // Filtro por data final (comparando apenas a data)
    if (datafinal) {
        query += ` AND data::DATE <= $${values.length + 1}`;
        values.push(datafinal);
    }

    const result = await client.query(query, values);
    return result.rows;
});



// Inicializando o servidor
server.listen({ port: 3333 }).then(() => {
    console.log('Servidor funcionando na porta 3333');
});
