import pg from 'pg';

export const client = new pg.Client({
  host: 'localhost',
  port: 32768,
  user: 'postgres',
  password: '12345',
  database: 'postgres'
});

client.connect()
  .then(() => console.log('¡Conexión exitosa a PostgreSQL!'))
  .catch(err => console.error('Error de conexión:', err));

