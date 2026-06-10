import { Client } from 'pg';
import * as Minio from 'minio'; // CORREGIDO: Sin las llaves { }

export const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB
});

export const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'admin',
  secretKey: 'password123'
});

client.connect()
  .then(() => console.log('¡Conexión exitosa a PostgreSQL!'))
  .catch(err => console.error('Error de conexión:', err));
