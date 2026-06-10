export const validarAdmin = async (req, res, next) => {
    const {rol} = req.user
    if (rol !== 1) {
        return res.status(401).json({mensaje: "Usted no es administrador y no tiene permisos para esta fucnión."})
    } else {
        next()
    }
}