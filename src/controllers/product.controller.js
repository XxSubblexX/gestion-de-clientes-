import { client, minioClient } from "../db.js";

export const getProductos = async (req, res) => {

    const {rows} = await client.query("SELECT * FROM productos ORDER BY created_at DESC");

    for (const producto of rows) {
  producto.fotografia_principal_url =
    await minioClient.presignedGetObject(
      'imagenes',
      producto.fotografia_principal_url,
      604800
    )
}
    res.json(rows)
}

export const getProducto = async (req, res) => {

    const {id_producto} = req.params    

    const {rows} = await client.query("SELECT * FROM productos WHERE id_producto = $1", [id_producto]);

    res.json(rows)
}

export const postProducto = async (req, res) => {

    const {nombre, descripcion, caracteristica, precio_venta, fotografia_url} = req.body
    if (!nombre?.trim() || !descripcion?.trim() || !caracteristica?.trim()) {
        return res.status(400).json({message: "Falta información."})
    }

    const {rows} = await client.query("INSERT INTO productos (nombre, descripcion, caracteristicas, precio_venta, fotografia_principal_url) VALUES ($1, $2, $3, $4, $5) RETURNING *" , [nombre, descripcion, caracteristica, precio_venta, fotografia_url]);

    let producto = rows[0]
  

  const fotografia_url_valida =
    await minioClient.presignedGetObject(
      'imagenes',
      fotografia_url,
      604800
    )

    producto.fotografia_principal_url = fotografia_url_valida

    res.json(producto)
}

export const putProducto = async (req, res) => {

    const {nombre, descripcion, caracteristica, precio_venta, nombreFoto, estado} = req.body
    const {id_producto} = req.params

    const foto = nombreFotoñ 
    if (!nombre?.trim() || !descripcion?.trim() || !caracteristica?.trim() || !foto?.trim() ) {
        return res.status(400).json({message: "missing information"})
    }

    const {rows} = await client.query("UPDATE productos SET nombre = $1, descripcion = $2, caracteristicas = $3, precio_venta = $4, fotografia_principal_url = $5, estado = $7 WHERE id_producto = $6 RETURNING *", [nombre, descripcion, caracteristica, precio_venta, foto, id_producto, estado]);
    const producto = rows[0]

  if (producto.fotografia_principal_url?.startsWith('http')) {
    const url = new URL(producto.fotografia_principal_url)
    producto.fotografia_principal_url = url.pathname.split('/').pop()
  }

  producto.fotografia_principal_url =
    await minioClient.presignedGetObject(
      'imagenes',
      producto.fotografia_principal_url,
      604800
    )

    res.json(producto)
}

export const deleteProducto = async (req, res) => {
  const { id_producto } = req.params;

  const { rows } = await client.query(
    "DELETE FROM productos WHERE id_producto = $1 RETURNING *", 
    [id_producto]
  );
  const producto = rows[0]; 

  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  // 2. Solo llamamos a MinIO si tenemos un nombre de archivo válido
  if (producto.fotografia_principal_url) {
    // Pasamos el nombre del archivo que extrajimos arriba
    await minioClient.removeObject('imagenes', producto.fotografia_principal_url);
  }

  res.json({ 
    mensaje: "Producto eliminado con éxito",
    producto 
  }); 
}
