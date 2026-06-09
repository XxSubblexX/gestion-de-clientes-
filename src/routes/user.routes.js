import { Router } from "express";

import { conseguirUsuario, conseguirUsuarios, añadirUsuario, actualizarUsuario, borrarUsuario, sesionUsuario, exportarRoles } from "../controllers/user.controller.js";
import { conseguirClientes, conseguirCliente, añadirCliente, borrarCliente, actualizarCliente } from "../controllers/client.controller.js";
import { verificarToken } from "../controllers/token.controller.js";

export const router = Router();

router.post("/login", sesionUsuario);


router.get("/usuarios", conseguirUsuarios);
router.get("/usuarios/:id_usuario", conseguirUsuario);
router.post("/usuarios", añadirUsuario);
router.put("/usuarios/:id_usuario", actualizarUsuario);
router.delete("/usuarios/:id_usuario", borrarUsuario);

router.get("/clientes", verificarToken, conseguirClientes);
router.get("/clientes/:id_cliente", verificarToken, conseguirCliente);
router.post("/clientes", verificarToken, añadirCliente);
router.put("/clientes/:id_cliente", verificarToken, actualizarCliente);
router.patch("/clientes/:id_cliente", verificarToken, borrarCliente);


router.get("/roles", exportarRoles);

export default router;