import fastify from 'fastify'
import { client } from './_database.ts'
import { z } from 'zod'

const server = fastify()
client.connect()
server.get('/teste', async(request, response) => {
    const dados = await client.query('SELECT * FROM entrada')
    return dados.rows
})

server.post('/entradaDeItems', async (request, reply) => {
    const createEventSchema = z.object({
        nfrecibo: z.number().nullable(),
        quantidade: z.number().min(1).nullable(),
        valorcompra: z.number().min(1).nullable(),
        nome: z.string().nullable(),
        fornecedor: z.string().nullable(),
    })

    const data = createEventSchema.parse(request.body)
    const result = await client.query('INSERT INTO entrada (nfrecibo,quantidade,valorcompra,nome,fornecedor) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [data.nfrecibo,data.quantidade,data.valorcompra,data.nome,data.fornecedor])
    return 'ok'
})

server.listen({port: 3333}).then((response)=>{
    console.log('funcionou caralho')
})
