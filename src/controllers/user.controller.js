import { client } from "../db.js";
import bcrypt from "bcryptjs";
import { router } from "../routes/routes.js";
import jwt from "jsonwebtoken";
import generatePassword from "generate-password";

// INICIAR SESIÓN (LOGIN)
export const sesionUsuario = async (req, res) => {
    // Saca el correo y la contraseña que envió el usuario
    const {correo, password} = req.body
    console.log({correo, password})
    // Si falta escribir el correo o la contraseña, avisa que falta información
    if (!correo?.trim() || !password?.trim()) {
            return res.status(400).json({ message: "missing information" })
        }

    // Busca en la base de datos si existe alguien con ese correo
    const { rows } = await client.query("SELECT * FROM usuarios WHERE correo = $1", [correo])
    
    // Si no encontró a nadie con ese correo, da error de credenciales inválidas
    if (rows.length === 0) {
            return res.status(401).json({ message: "correo invalido" })
        }
    
    // Guarda los datos del usuario encontrado
    const usuario = rows[0]

    // Compara la contraseña que escribió el usuario con la que está guardada en la base de datos
    const contraseñacorrecta = await bcrypt.compare(password, usuario.password);
        
        // Si las contraseñas no coinciden, da error
        if (!contraseñacorrecta) {
            return res.status(401).json({ message: "contraseña invalida" })
        }
    
    // Guarda el ID y el nombre del usuario dentro del pase digital (token)
    const payload = { 
            id: usuario.id_usuario, 
            nombre: usuario.nombre,
            rol: usuario.id_rol,
            estado: usuario.estado
        };

    // Usa una clave secreta para asegurar que nadie altere el pase digital
    const secretKey = process.env.JWT_SECRET || "iw213874y387edh3728hrf8q274rr89743trhy"

    // Crea el pase digital (token) y le da una duración de 2 horas
    const token = jwt.sign(payload, secretKey, { expiresIn: "2h" })

    // Responde que todo salió bien y entrega el pase digital
    res.json({ 
        message: "Login exitoso",
        token,
        payload
    });
}

// VER TODOS LOS USUARIOS
export const getUsuarios = async (req, res) => {
    // Trae a todos los usuarios de la lista
    const {rows} = await client.query("SELECT id_usuario, nombre, correo, id_rol, estado FROM usuarios ORDER BY created_at DESC");

    // Muestra la lista completa en la pantalla
    res.json(rows);
}

// VER UN SOLO USUARIO
export const getUsuario = async (req, res) => {
    // Saca el ID del usuario desde el enlace (URL)
    const {id_usuario} = req.params;

    // Busca al usuario que tenga exactamente ese ID
    const {rows} = await client.query("SELECT nombre, correo FROM usuarios WHERE id_usuario = $1", [id_usuario]);
    
    // Si no encontró a nadie, avisa que el usuario no existe
    if (rows.length === 0) {
        return res.status(404).json({message: "user not found"})
    };

    // Si lo encontró, muestra su información
    res.json(rows[0])
}

// CREAR UN NUEVO USUARIO
export const postUsuario = async (req, res) => {
    const {nombre, correo, id_rol} = req.body

    if (!nombre?.trim() || !correo?.trim() || !id_rol ) {
        return res.status(400).json({message: "missing information"})
    }

        const newPassword = generatePassword.generate(
            {
                length: 10,
                numbers: true,
            }
        )


    let hash = await bcrypt.hash(newPassword, 10)

    const {rows} = await client.query("INSERT INTO usuarios (nombre, correo, password, id_rol) VALUES ($1, $2, $3, $4) RETURNING *", [nombre, correo, hash, id_rol])
    
    res.json(
        {
        password: newPassword
    }
)
}

// MODIFICAR UN USUARIO
export const putUsuario = async (req, res) => {
    // Saca el ID del usuario que se va a cambiar desde el enlace (URL)
    const {id_usuario} = req.params
    // Recibe los nuevos datos (nombre, correo, contraseña)
    const {nombre, correo, password, id_rol, estado} = req.body
    // Revisa que los campos nuevos no estén vacíos
    if (!nombre?.trim() || !correo?.trim()) {
        return res.status(400).json({message: "missing information"})
    }
    let datos = null;
    let query5 = ""; 
    
    // Encripta la nueva contraseña para mantenerla segura
    if(password){
        let hash = await bcrypt.hash(password, 10)
        datos =[nombre, correo, id_usuario, estado, hash] 
        query5 = ", password = $5"
    } else {
        if (!id_rol) {
            datos = [nombre, correo, id_usuario, estado]
            query5 = ""
        } else {
            datos = [nombre, correo, id_usuario, estado, id_rol]
            query5 = ", id_rol = $5"
        }
         
    }

    // Cambia los datos viejos por los nuevos en el usuario con ese ID
    const {rows} = await client.query(`UPDATE usuarios SET nombre = $1, correo = $2, estado = $4  ${query5} WHERE id_usuario = $3 RETURNING *`, [...datos])
    
    // Confirma que el usuario fue actualizado
    res.json(rows[0]);
}

// ELIMINAR UN USUARIO
export const deleteUsuario = async (req, res) => {
    // Saca el ID del usuario que se quiere borrar desde el enlace (URL)
    const {id_usuario} = req.params
    
    // Borra al usuario que tenga ese ID de la lista
    const {rows, rowCount} = await client.query("DELETE FROM usuarios WHERE id_usuario = $1 RETURNING *", [id_usuario])
    
    // Si la cuenta de borrados es cero, significa que ese ID no existía
    if (rowCount === 0) {
        return res.status(404).json({message: "user not found"})
    }

    // Devuelve los datos del usuario que acaba de borrar
    res.send(rows)
}

export const getRoles = async (req, res) => {
    const {rows} = await client.query("SELECT * FROM roles where estado = true ");

    res.json(rows);
}