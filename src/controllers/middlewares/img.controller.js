import { minioClient } from "../../db.js";

export const uploadToMinio = async (req, res, next) => {
    try {
        console.log(req.file)
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

        req.body.fotografia_url = `http://localhost:9000/imagenes/${nombreUnico}`;
        
        next();
    } catch (error) {
        console.error("Error crítico subiendo a MinIO:", error);
        return res.status(500).json({ message: "Error interno al procesar la imagen con MinIO." });
    }
};
