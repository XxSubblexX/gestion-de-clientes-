export const validarRol = async (req, res, next) => {
    const { rol } = req.user;

    if (rol === 1) {
        // Código o permisos exclusivos para el Rol 1 (ej: Administrador)
        return next(); 
    } else if (rol === 2) {
        // Código o permisos exclusivos para el Rol 2 (ej: Editor / Moderador)
        return next(); 
    } else {
        // Si no es ninguno de los roles anteriores, se deniega el acceso
        return res.status(401).json({ 
            mensaje: "Usted no tiene permisos para esta función." 
        });
    }
};