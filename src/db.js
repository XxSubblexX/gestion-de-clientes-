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
  endPoint: process.env.IO_ENDPOINT,
  port: process.env.IO_PORT,
  useSSL:  false,
  accessKey: process.env.IO_ACC_KEY,
  secretKey: process.env.IO_SECRET_KEY
});

client.connect()
  .then(() => console.log('¡Conexión exitosa a PostgreSQL!'))
  .catch(err => console.error('Error de conexión:', err));
