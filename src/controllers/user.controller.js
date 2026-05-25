import { client } from "../db.js";
import bcrypt from "bcryptjs";
import { router } from "../routes/user.routes.js";
import jwt from "jsonwebtoken";

// INICIAR SESIÓN (LOGIN)
export const sesionUsuario = async (req, res) => {
    // Saca el correo y la contraseña que envió el usuario
    const {correo, password} = req.body

    // Si falta escribir el correo o la contraseña, avisa que falta información
    if (!correo?.trim() || !password?.trim()) {
            return res.status(400).json({ message: "missing information" })
        }

    // Busca en la base de datos si existe alguien con ese correo
    const { rows  } = await client.query("SELECT * FROM usuarios WHERE correo = $1", [correo])
    
    // Si no encontró a nadie con ese correo, da error de credenciales inválidas
    if (rows.length === 0) {
            return res.status(401).json({ message: "invalid credentials" })
        }
    
    // Guarda los datos del usuario encontrado
    const usuario = rows[0]

    // Compara la contraseña que escribió el usuario con la que está guardada en la base de datos
    const contraseñacorrecta = await bcrypt.compare(password, usuario.password);
        
        // Si las contraseñas no coinciden, da error
        if (!contraseñacorrecta) {
            return res.status(401).json({ message: "invalid credentials" })
        }
    
    // Guarda el ID y el nombre del usuario dentro del pase digital (token)
    const payload = { 
            id: usuario.id_usuario, 
            nombre: usuario.nombre 
        };

    // Usa una clave secreta para asegurar que nadie altere el pase digital
    const secretKey = process.env.JWT_SECRET || "iw213874y387edh3728hrf8q274rr89743trhy"

    // Crea el pase digital (token) y le da una duración de 2 horas
    const token = jwt.sign(payload, secretKey, { expiresIn: "2h" })

    // Responde que todo salió bien y entrega el pase digital
    res.json({ 
        message: "Login exitoso",
        token 
    });
}

// VER TODOS LOS USUARIOS
export const conseguirUsuarios = async (req, res) => {
    // Trae a todos los usuarios de la lista
    const {rows} = await client.query("SELECT * FROM usuarios");
    console.log(rows);
    // Muestra la lista completa en la pantalla
    res.json(rows);
}

// VER UN SOLO USUARIO
export const conseguirUsuario = async (req, res) => {
    // Saca el ID del usuario desde el enlace (URL)
    const {id_usuario} = req.params;

    // Busca al usuario que tenga exactamente ese ID
    const {rows} = await client.query("SELECT * FROM usuarios WHERE id_usuario = $1", [id_usuario]);
    
    // Si no encontró a nadie, avisa que el usuario no existe
    if (rows.length === 0) {
        return res.status(404).json({message: "user not found"})
    };

    // Si lo encontró, muestra su información
    res.json(rows)
}

// CREAR UN NUEVO USUARIO
export const añadirUsuario = async (req, res) => {
    // Recibe el nombre, correo y contraseña del nuevo usuario
    const {nombre, correo, password} = req.body

    // Revisa que no haya dejado ningún campo en blanco
    if (!nombre?.trim() || !correo?.trim() || !password?.trim()) {
        return res.status(400).json({message: "missing information"})
    }

    // Encripta/Esconde la contraseña para que sea segura y nadie la pueda ver
    let hash = await bcrypt.hash(password, 10)

    // Guarda al nuevo usuario en la lista con su contraseña ya escondida
    const {rows} = await client.query("INSERT INTO usuarios (nombre, correo, password) VALUES ($1, $2, $3) RETURNING *", [nombre, correo, hash])
    
    console.log(rows)
    // Confirma que el usuario fue creado con éxito
    res.status(201).send("añadiendo usuarios")
}

// MODIFICAR UN USUARIO
export const actualizarUsuario = async (req, res) => {
    // Saca el ID del usuario que se va a cambiar desde el enlace (URL)
    const {id_usuario} = req.params
    // Recibe los nuevos datos (nombre, correo, contraseña)
    const {nombre, correo, password} = req.body
    
    // Revisa que los campos nuevos no estén vacíos
    if (!nombre?.trim() || !correo?.trim() || !password?.trim()) {
        return res.status(400).json({message: "missing information"})
    }
    
    // Encripta la nueva contraseña para mantenerla segura
    let hash = await bcrypt.hash(password, 10)
    
    // Cambia los datos viejos por los nuevos en el usuario con ese ID
    const {rows} = await client.query("UPDATE usuarios SET nombre = $1, correo = $2, password = $3 WHERE id_usuario = $4", [nombre, correo, hash, id_usuario])
    
    console.log(rows)
    // Confirma que el usuario fue actualizado
    res.send("actualizando usuario")
}

// ELIMINAR UN USUARIO
export const borrarUsuario = async (req, res) => {
    // Saca el ID del usuario que se quiere borrar desde el enlace (URL)
    const {id_usuario} = req.params
    
    // Borra al usuario que tenga ese ID de la lista
    const {rows, rowCount} = await client.query("DELETE FROM usuarios WHERE id_usuario = $1 RETURNING *", [id_usuario])
    
    console.log(rows)

    // Si la cuenta de borrados es cero, significa que ese ID no existía
    if (rowCount === 0) {
        return res.status(404).json({message: "user not found"})
    }

    // Devuelve los datos del usuario que acaba de borrar
    res.send(rows)
}