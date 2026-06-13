import pg from 'pg'
import './dotenv.js'

const config = {
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    ssl: {
        rejectUnauthorized: false
    }
}

/*
The ssl configuration tells the PostgreSQL client to use an 
encrypted (TLS/SSL) connection to the database server.

Specifically, rejectUnauthorized: false disables certificate verification — 
meaning the client will encrypt the connection but won't validate that the server's SSL certificate 
is signed by a trusted authority. This is common when:
Connecting to cloud-hosted databases (e.g., Heroku Postgres, Render, Railway) 
that use self-signed certificates
*/

export const pool = new pg.Pool(config)