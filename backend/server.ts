import fastify from 'fastify'
import { client } from './_database.ts'
import { z } from 'zod'
import cors from '@fastify/cors'
import formbody from '@fastify/formbody';
import multipart from '@fastify/multipart'
const server = fastify()
await server.register(cors, { 
    
})
await server.register(formbody);

client.connect()
server.get('/teste', async(request, response) => {
    const dados = await client.query('SELECT * FROM entrada')
    return dados.rows
})

server.post('/entradaDeItems', async (request, reply) => {
    
   
    const createEventSchema = z.object({
        nfrecibo: z.string().nullable(),
        quantidade: z.string().min(1).nullable(),
        valorcompra: z.string().min(1).nullable(),
        nome: z.string().nullable(),
        fornecedor: z.string().nullable(),
    })
    console.log(request.body)
    const data = await createEventSchema.parse(request.body)
    const result = await client.query('INSERT INTO entrada (nfrecibo,quantidade,valorcompra,nome,fornecedor) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [data.nfrecibo,data.quantidade,data.valorcompra,data.nome,data.fornecedor])
    return result.rows
})

server.listen({port: 3333}).then((response)=>{
    console.log('funcionou caralho')
})
