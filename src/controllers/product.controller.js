import { client } from "../db.js";

export const getProductos = async (req, res) => {

    const {rows} = await client.query("SELECT * FROM productos");
    
    res.json(rows)
}

export const getProducto = async (req, res) => {

    const {id_producto} = req.params    

    const {rows} = await client.query("SELECT * FROM productos WHERE id_producto = $1", [id_producto]);

    res.json(rows)
}

export const postProducto = async (req, res) => {

    const {nombre, descripcion, caracteristica, precio, fotografia_url} = req.body

    if (!nombre?.trim() || !descripcion?.trim() || !caracteristica?.trim()) {
        return res.status(400).json({message: "Falta información."})
    }

    const {rows} = await client.query("INSERT INTO productos (nombre, descripcion, caracteristicas, precio_venta, fotografia_principal_url) VALUES ($1, $2, $3, $4, $5)" , [nombre, descripcion, caracteristica, precio, fotografia_url]);

    res.json(rows)
}

export const putProducto = async (req, res) => {

    const {nombre, descripcion, caracteristica, precio, fotografia_url} = req.body
    const {id_producto} = req.params

    if (!nombre?.trim() || !descripcion?.trim() || !caracteristica?.trim() || !fotografia_url?.trim() ) {
        return res.status(400).json({message: "missing information"})
    }

    const {rows} = await client.query("UPDATE productos SET nombre = $1, descripcion = $2, caracteristicas = $3, precio_venta = $4, fotografia_principal_url = $5 WHERE id_producto = $6", [nombre, descripcion, caracteristica, precio, fotografia_url, id_producto]);

    res.json(rows)
}

export const patchProducto = async (req, res) => {

    const {id_producto} = req.params
    const {estado} = req.body

    const {rows} = await client.query("UPDATE productos SET estado = $1 WHERE id_producto = $2", [estado, id_producto])

    res.json(rows)
}