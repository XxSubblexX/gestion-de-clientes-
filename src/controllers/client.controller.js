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