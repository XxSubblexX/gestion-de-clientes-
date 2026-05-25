import { client } from "../db.js";
import bcrypt from "bcryptjs";
import { router } from "../routes/user.routes.js";
import jwt from "jsonwebtoken";

export const sesionUsuario = async (req, res) => {
    // saca correo y contraseña del JSON enviado por metodo POST.
    const {correo, password} = req.body

    // valida si no hay campos vacios.
    if (!correo?.trim() || !password?.trim()) {
            return res.status(400).json({ message: "missing information" })
        }

    // si no está vacio, procede a hacer una busqueda del correo.
    const { rows  } = await client.query("SELECT * FROM usuarios WHERE correo = $1", [correo])
    
    // si las columna correo llega vacia, entonces marca error 401.
    if (rows.length === 0) {
            return res.status(401).json({ message: "invalid credentials" })
        }
    
    // si la consigue, guarda el correo y contraseña encriptada en este arreglo.
    const usuario = rows[0]

    // de la contraseña encriptada, compara la dada por el usuario y la encriptada para ver si son iguales.
    const contraseñacorrecta = await bcrypt.compare(password, usuario.password);
        
        // si no coinciden, marca como error 401. (credenciales invalidas)
        if (!contraseñacorrecta) {
            return res.status(401).json({ message: "invalid credentials" })
        }
    
    // en el payload, se guarda la información del nombre y su respectivo ID
    const payload = { 
            id: usuario.id_usuario, 
            nombre: usuario.nombre 
        };

        // la llave secreta es una combinación de caracteres encriptados para evitar manipulaciones.
        const secretKey = process.env.JWT_SECRET || "iw213874y387edh3728hrf8q274rr89743trhy"

        // genera el token, con un tiempo de expiración de dos horas
        const token = jwt.sign(payload, secretKey, { expiresIn: "2h" })

        // confirma la generación del token
        res.json({ 
            message: "Login exitoso",
            token 
        });
}


export const conseguirUsuarios = async (req, res) => {
    const {rows} = await client.query("SELECT * FROM usuarios");
    console.log(rows);
    res.json(rows);
}

export const conseguirUsuario = async (req, res) => {

    // saca id del usuario del parametro "id_usuario" en la petición http
    const {id_usuario} = req.params;

    // selecciona toda la información de la tabla usuarios con el id 
    const {rows} = await client.query("SELECT * FROM usuarios WHERE id_usuario = $1", [id_usuario]);
    
    // si la columna está vacia y no se encuentra la info, suelta error 404
    if (rows.length === 0) {
        return res.status(404).json({message: "user not found"})
    };

    // si no está vacia, suelta la información de las columnas de la consulta
    res.json(rows)
}

export const añadirUsuario = async (req, res) => {
    const {nombre, correo, password} = req.body

    // valida campos
    if (!nombre?.trim() || !correo?.trim() || !password?.trim()) {
        return res.status(400).json({message: "missing information"})
    }

    // revuelve contraseña 10 veces
    let hash = await bcrypt.hash(password, 10)

    // hace una inserción a la base de datos con los datos enviados en JSON 
    const {rows} = await client.query("INSERT INTO usuarios (nombre, correo, password) VALUES ($1, $2, $3) RETURNING *", [nombre, correo, hash])
    
    // muestra en consola la inserción
    console.log(rows)

    //confirma la inserción con un status 200
    res.status(201).send("añadiendo usuarios")
}

export const actualizarUsuario = async (req, res) => {
    const {id_usuario} = req.params
    const {nombre, correo, password} = req.body
    if (!nombre?.trim() || !correo?.trim() || !password?.trim()) {
        return res.status(400).json({message: "missing information"})
    }
    let hash = await bcrypt.hash(password, 10)
    const {rows} = await client.query("UPDATE usuarios SET nombre = $1, correo = $2, password = $3 WHERE id_usuario = $4", [nombre, correo, hash, id_usuario])
    console.log(rows)
    res.send("actualizando usuario")
}

export const borrarUsuario = async (req, res) => {
    const {id_usuario} = req.params
    const {rows, rowCount} = await client.query("DELETE FROM usuarios WHERE id_usuario = $1 RETURNING *", [id_usuario])
    console.log(rows)

    if (rowCount === 0) {
        return res.status(404).json({message: "user not found"})
    }

    res.send(rows)
}

