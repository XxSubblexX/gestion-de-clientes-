import { minioClient } from "../../db.js";

export const uploadToMinio = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "La imagen es obligatoria." });
        }
        const foto = req.file;
        const nombreUnico = `${Date.now()}-${foto.originalname}`;

        await minioClient.putObject(
            "imagenes",
            nombreUnico,
            foto.buffer,
            foto.size,
            { "Content-Type": foto.mimetype }
        );

        req.body.fotografia_url = nombreUnico;
        
        next();
    } catch (error) {
        console.error("Error crítico subiendo a MinIO:", error);
        return res.status(500).json({ message: "Error interno al procesar la imagen con MinIO." });
    }
};

export const updateToMinio = async (req, res, next) => {
    const { nombreFoto } = req.body
    const fotoNueva = req.file
   
    if(!fotoNueva) {
        return next()
    }  else {
    // 1. Limpiar la URL para obtener solo el nombre del archivo viejo
    const partesUrl = nombreFoto.split('/');
    const nombreConQuery = partesUrl[partesUrl.length - 1]; 
    const nombreArchivoViejo = nombreConQuery.split('?')[0]; 

    try {
        // 2. Borrar la foto vieja de tu bucket (cambia 'imagenes' por el tuyo)
        await minioClient.removeObject('imagenes', nombreArchivoViejo);

        // 3. Crear un nombre único para la foto nueva
        const nombreArchivoNuevo = `${Date.now()}-${fotoNueva.originalname}`;
        console.log("FOTO:", nombreFoto);
        // 4. Subir la foto nueva usando el buffer de Multer
        await minioClient.putObject(
            'imagenes', 
            nombreArchivoNuevo, 
            fotoNueva.buffer, 
            fotoNueva.size, 
            { 'Content-Type': fotoNueva.mimetype }
        );

        // 5. Guardar el nuevo nombre en req.body para que llegue a tu controlador final
        req.body.nombreFoto = nombreArchivoNuevo;

        next();
    } catch (error) {
        console.error("ERROR REAL DE MINIO:", error); 
        return res.status(500).json({ error: "Error al procesar los archivos en Minio" });
    }
}

}