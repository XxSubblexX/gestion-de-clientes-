import jwt from "jsonwebtoken";

export const verificarToken = (req, res, next) => {
    // obtener la cabecera Authorization
    const authHeader = req.headers['token'];
    
    // verificar que exista la cabecera y use el formato Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Acceso denegado. Token no provisto." });
    }

    // cortar el texto para obtener solo la cadena del token
    const token = authHeader.split(' ')[1];
    const secretKey = process.env.JWT_SECRET;

    // validar usando el callback nativo 
    jwt.verify(token, secretKey, (error, datosDecodificados) => {
        if (error) {
            return res.status(403).json({ message: "Token inválido o expirado." });
        }

        // si todo está bien, inyectar los datos en la petición y continuar
        req.user = datosDecodificados; 
        next(); 
    });
};
