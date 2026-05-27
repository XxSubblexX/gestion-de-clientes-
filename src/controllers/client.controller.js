import { client } from "../db.js";
import { router } from "../routes/user.routes.js";
import jwt from "jsonwebtoken";

// CREAR UN NUEVO CLIENTE
export const añadirCliente = async (req, res) => {
    // Recibe los datos de la empresa o cliente desde el formulario (JSON)
    const { nit, razon_social, correo, telefono, estado } = req.body
    // Descubre quién es el usuario que inició sesión y está creando este cliente
    const idUsuarioLogueado = req.user.id;

    // Revisa que no dejen campos obligatorios vacíos o con puros espacios
    if (!nit?.trim() || !razon_social?.trim() || !correo?.trim() || !telefono?.trim()) {
        return res.status(400).json({message: "missing information"})
    }

    // Guarda al nuevo cliente en la base de datos y lo amarra al usuario logueado
    const {rows} = await client.query("INSERT INTO clientes (nit, razon_social, correo, telefono, id_usuario, estado) VALUES ($1, $2, $3,$4, $5, $6) RETURNING *", [nit, razon_social, correo, telefono, idUsuarioLogueado, estado])
    
    // Muestra en la consola el cliente que se acaba de crear
    console.log(rows)

    // Confirma que el cliente fue añadido con éxito
    res.status(201).send("añadiendo usuarios")
}

// VER TODOS LOS CLIENTES DE ESTE USUARIO
export const conseguirClientes = async (req, res) => {
    // Averigua quién es el usuario que está pidiendo la lista
    const idUsuarioLogueado = req.user.id;
    
    // Trae de la base de datos únicamente los clientes creados por este usuario
    const {rows} = await client.query("SELECT * FROM clientes WHERE id_usuario = $1", [idUsuarioLogueado]);
    
    // Muestra la lista de sus clientes en la pantalla
    res.json(rows);
}

// VER UN SOLO CLIENTE
export const conseguirCliente = async (req, res) => {
    // Saca el ID del cliente desde el enlace (URL)
    const {id_cliente} = req.params;
    // Averigua quién es el usuario que lo está buscando
    const idUsuarioLogueado = req.user.id;

    // Busca al cliente por su ID, pero se asegura de que pertenezca al usuario logueado
    const {rows} = await client.query("SELECT * FROM clientes WHERE id_cliente = $1 AND id_usuario = $2", [id_cliente, idUsuarioLogueado]);
    
    // Si no encontró nada, avisa que ese cliente no existe para este usuario
    if (rows.length === 0) {
        return res.status(404).json({message: "user not found"})
    };

    // Si lo encuentra, muestra los datos del cliente en pantalla
    res.json(rows)
}

// ELIMINAR UN CLIENTE
export const borrarCliente = async (req, res) => {
    // Saca el ID del cliente que se quiere borrar desde el enlace (URL)
    const {id_cliente} = req.params;
    // Averigua quién está intentando borrarlo
    const idUsuarioLogueado = req.user.id;
    
    // Borra al cliente de la lista de forma permanente si coincide con el usuario logueado
    const {rows, rowCount} = await client.query("DELETE FROM clientes WHERE id_cliente = $1 AND id_usuario = $2 RETURNING *", [id_cliente, idUsuarioLogueado]);

    // Si la cuenta de borrados es cero, significa que ese cliente no existía o no te pertenece
    if (rowCount === 0) {
        return res.status(404).json({message: "user not found"})
    }

    // Devuelve los datos del cliente que se eliminó
    res.send(rows)
}

// MODIFICAR UN CLIENTE
export const actualizarCliente = async (req, res) => {
    // Saca el ID del cliente que se va a cambiar desde el enlace (URL)
    const {id_cliente} = req.params
    // Averigua quién es el usuario dueño de este cliente
    const idUsuarioLogueado = req.user.id;
    // Recibe los nuevos datos modificados de la empresa
    const {nit, razon_social, correo, telefono, estado} = req.body
    
    // Revisa que los campos obligatorios no se queden vacíos
    if (!nit?.trim() || !razon_social?.trim() || !correo?.trim() || !telefono?.trim()) {
        return res.status(400).json({message: "missing information"})
    }
    
    // Cambia los datos del cliente que coincida con el ID y pertenezca al usuario logueado
    const {rows, rowCount} = await client.query(
        "UPDATE clientes SET nit = $1, razon_social = $2, correo = $3, telefono = $4, estado = $5 WHERE id_cliente = $6 AND id_usuario = $7 RETURNING *", 
        [nit, razon_social, correo, telefono, estado, id_cliente, idUsuarioLogueado]
    )
    
    console.log(rows)

    // Si no encontró al cliente o no le pertenece a este usuario, da error 404
    if (rowCount === 0) {
        return res.status(404).json({message: "client not found"})
    }
    
    // Confirma entregando los nuevos datos guardados del cliente
    res.json(rows)
}
