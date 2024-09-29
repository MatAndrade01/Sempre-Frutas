import pg from 'pg'

const client = new pg.Client({
    user: 'postgres',
    host:'localhost',
    database:'Sempre_Frutas',
    password:'1',
    port:5432,
})

export {client};