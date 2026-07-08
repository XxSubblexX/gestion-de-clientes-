import { Router } from "express";
import multer from 'multer';

import { getUsuario, getUsuarios, postUsuario, putUsuario, deleteUsuario, sesionUsuario, getRoles } from "../controllers/user.controller.js";
import { getClientes, getCliente, postCliente, patchCliente, putCliente } from "../controllers/client.controller.js";
import { verificarToken } from "../controllers/middlewares/token.controller.js";
import { deleteProducto, getProductos, getProducto, postProducto, putProducto } from "../controllers/product.controller.js";
import { updateToMinio, uploadToMinio } from "../controllers/middlewares/img.controller.js";
import { validarAdmin } from "../controllers/middlewares/admin.controller.js";
import { validarComerciante } from "../controllers/middlewares/comerciante.controller.js";
import { validarRol } from "../controllers/middlewares/roles.controller.js";
import { getFacturas, postFactura } from "../controllers/bill.controller.js";
import { validarCliente } from "../controllers/middlewares/cliente.controller.js";

export const router = Router();
export const upload = multer({ storage: multer.memoryStorage() }); 

router.post("/login", sesionUsuario);

router.post("/facturas", verificarToken, validarCliente, postFactura)
router.get("/facturas",verificarToken, getFacturas)

router.get("/usuarios", verificarToken, validarAdmin, getUsuarios);
router.get("/usuarios/:id_usuario", getUsuario);
router.post("/usuarios", verificarToken, validarAdmin, postUsuario);
router.put("/usuarios/:id_usuario", verificarToken, validarRol, putUsuario);
router.delete("/usuarios/:id_usuario", verificarToken, validarAdmin, deleteUsuario);

router.get("/clientes/:id_usuario", verificarToken, validarComerciante, getClientes);
router.post("/clientes", verificarToken, validarComerciante, postCliente);
router.put("/clientes/:id_cliente", verificarToken, validarComerciante, putCliente);
router.patch("/clientes/:id_cliente", verificarToken, validarComerciante, patchCliente);

router.get("/productos", getProductos);
router.post("/productos", verificarToken, validarAdmin, upload.single('foto'), uploadToMinio, postProducto);
router.put("/productos/:id_producto", verificarToken, validarAdmin, upload.single('fotoNueva'), updateToMinio, putProducto);
router.delete("/productos/:id_producto", verificarToken, validarAdmin, deleteProducto);

router.get("/roles", getRoles);

export default router; 