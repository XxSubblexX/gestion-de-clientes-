export const validarComerciante = async (req, res, next) => {
    const {rol} = req.user
    if (rol !== 2) {
        return res.status(401).json({mensaje: "Usted no es comerciante y no tiene permisos para esta fucnión."})
    } else {
        next()
    }
}