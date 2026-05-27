
import { Client } from 'pg';

export const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB
});

client.connect()
  .then(() => console.log('¡Conexión exitosa a PostgreSQL!'))
  .catch(err => console.error('Error de conexión:', err));
