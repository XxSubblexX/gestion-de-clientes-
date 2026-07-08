import { client } from "../../db.js";

export const validarCliente = async (req, res, next) => {
    try {
        const { id_cliente, id_usuario } = req.body;

        const { rows } = await client.query(
            "SELECT * FROM clientes WHERE id_cliente = $1 AND id_usuario = $2", 
            [id_cliente, id_usuario]
        );

        
        // Ejemplo de validación para continuar el middleware:
        if (rows.length === 0) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        } else {
            next()
        }
    } catch (error) {
        console.error("Error en la base de datos:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
