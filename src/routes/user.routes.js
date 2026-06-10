import { Router } from "express";
import multer from 'multer';

import { getUsuario, getUsuarios, postUsuario, putUsuario, deleteUsuario, sesionUsuario, exportarRoles } from "../controllers/user.controller.js";
import { conseguirClientes, conseguirCliente, añadirCliente, borrarCliente, actualizarCliente } from "../controllers/client.controller.js";
import { verificarToken } from "../controllers/middlewares/token.controller.js";
import { getProducto, getProductos, patchProducto, postProducto, putProducto } from "../controllers/product.controller.js";
import { uploadToMinio } from "../controllers/middlewares/img.controller.js";
import { validarAdmin } from "../controllers/middlewares/admin.controller.js";
import { validarComerciante } from "../controllers/middlewares/comerciante.controller.js";

export const router = Router();
export const upload = multer({ storage: multer.memoryStorage() });

router.post("/login", sesionUsuario);

router.get("/usuarios", verificarToken, validarAdmin, getUsuarios);
router.get("/usuarios/:id_usuario", getUsuario);
router.post("/usuarios", verificarToken, validarAdmin, postUsuario);
router.put("/usuarios/:id_usuario", verificarToken, validarAdmin, putUsuario);
router.delete("/usuarios/:id_usuario", verificarToken, validarAdmin, deleteUsuario);

router.get("/clientes", verificarToken, validarComerciante, conseguirClientes);
router.get("/clientes/:id_cliente", conseguirCliente);
router.post("/clientes", verificarToken, validarComerciante, añadirCliente);
router.put("/clientes/:id_cliente", verificarToken, validarComerciante, actualizarCliente);
router.patch("/clientes/:id_cliente", verificarToken, validarComerciante, borrarCliente);

router.get("/productos", getProductos);
router.get("/productos/:id_producto", getProducto);
router.post("/productos", upload.single('foto'), uploadToMinio, postProducto);
router.put("/productos/:id_producto", putProducto);
router.patch("/productos/:id_producto", patchProducto);

router.get("/roles", exportarRoles);

export default router;