import { client } from "../db.js";
import { router } from "../routes/user.routes.js";
import jwt from "jsonwebtoken";

export const añadirCliente = async (req, res) => {
    const { nit, razon_social, correo, telefono, estado } = req.body
    const idUsuarioLogueado = req.user.id;

    if (!nit?.trim() || !razon_social?.trim() || !correo?.trim() || !telefono?.trim()) {
        return res.status(400).json({message: "missing information"})
    }

    const {rows} = await client.query("INSERT INTO clientes (nit, razon_social, correo, telefono, id_usuario, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [nit, razon_social, correo, telefono, idUsuarioLogueado, estado])
    
    // muestra en consola la inserción
    console.log(rows)

    //confirma la inserción con un status 201
    res.status(201).send("añadiendo usuarios")
}

export const conseguirClientes = async (req, res) => {
    const idUsuarioLogueado = req.user.id;
    const {rows} = await client.query("SELECT * FROM clientes WHERE id_usuario = $1", [idUsuarioLogueado]);
    console.log(rows);
    res.json(rows);
}

export const conseguirCliente = async (req, res) => {

    const {id_cliente} = req.params;
    const idUsuarioLogueado = req.user.id;


    const {rows} = await client.query("SELECT * FROM clientes WHERE id_cliente = $1 AND id_usuario = $2", [id_cliente, idUsuarioLogueado]);
    
    if (rows.length === 0) {
        return res.status(404).json({message: "user not found"})
    };

    res.json(rows)
}

export const borrarCliente = async (req, res) => {

    const {id_cliente} = req.params;
    const idUsuarioLogueado = req.user.id;
    
    const {rows, rowCount} = await client.query("DELETE FROM clientes WHERE id_cliente = $1 AND id_usuario = $2 RETURNING *", [id_cliente, idUsuarioLogueado]);

    console.log(rows)

    if (rowCount === 0) {
        return res.status(404).json({message: "user not found"})
    }

    res.send(rows)
}

export const actualizarCliente = async (req, res) => {
    const {id_cliente} = req.params
    const idUsuarioLogueado = req.user.id;
    const {nit, razon_social, correo, telefono, estado} = req.body
    
    if (!nit?.trim() || !razon_social?.trim() || !correo?.trim() || !telefono?.trim()) {
        return res.status(400).json({message: "missing information"})
    }
    
    const {rows, rowCount} = await client.query(
        "UPDATE clientes SET nit = $1, razon_social = $2, correo = $3, telefono = $4, estado = $5 WHERE id_cliente = $6 AND id_usuario = $7 RETURNING *", 
        [nit, razon_social, correo, telefono, estado, id_cliente, idUsuarioLogueado]
    )
    
    console.log(rows)

    if (rowCount === 0) {
        return res.status(404).json({message: "client not found"})
    }
    
    res.json(rows)
}