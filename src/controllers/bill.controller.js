import  { client } from "../db.js";
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';

export const postFactura = async (req, res) => {
    try {
        const { id_cliente, productos, id_usuario } = req.body

        // 1. CONTROL DE TRANSACCIÓN BD
        await client.query("BEGIN")

        // Obtener el siguiente consecutivo de la factura
        const { rows: secuencia } = await client.query("SELECT nextval('secuencia_factura')")
        const consecutivo = secuencia[0].nextval
        const num_factura = `FAC-${new Date().getFullYear()}-${String(consecutivo).padStart(6, "0")}`

        // Obtener datos del cliente
        const { rows: datosCliente } = await client.query(
            "SELECT razon_social, correo FROM clientes WHERE id_cliente = $1",
            [id_cliente]
        );
        const cliente = datosCliente[0];

        // Insertar la factura
        const { rows } = await client.query(
            `INSERT INTO facturas (num_factura, id_cliente, id_usuario)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [num_factura, id_cliente, id_usuario]
        )
        const id_factura = rows[0].id_factura

        // Insertar los productos facturados
        const promesasProductos = productos.map((prod) => {
            return client.query(
                `INSERT INTO productos_facturados
                (id_factura, id_producto, cantidad, precio_venta)
                VALUES ($1, $2, $3, $4)`,
                [id_factura, prod.id_producto, prod.cantidad, prod.precio_venta] 
            )
        })
        await Promise.all(promesasProductos)

        await client.query("COMMIT")


        const pdfBuffer = await new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            let buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', (err) => reject(err));


            doc.fontSize(20).text('FACTURA COMERCIAL', { align: 'right' });
            doc.fontSize(10).text(`Número: ${num_factura}`);
            doc.text(`Fecha: ${new Date().toLocaleDateString()}`);
            doc.moveDown();
            doc.text(`Cliente: ${cliente?.razon_social || 'N/A'}`);
            doc.moveDown();

            doc.text('Detalle de Productos:', { underline: true });
            let total = 0;
            productos.forEach((prod) => {
                const subtotal = prod.cantidad * prod.precio_venta;
                total += subtotal;
                doc.text(`- ID Prod: ${prod.id_producto} x ${prod.cantidad} unidades @ $${prod.precio_venta} = $${subtotal}`);
            });

            doc.moveDown();
            doc.fontSize(14).text(`Total a Pagar: $${total}`, { bold: true });

            doc.end();
        });

        // 3. ENVÍO DEL CORREO (En segundo plano controlado)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "williamortiz124554@gmail.com",
                pass: process.env.ACCESS_EMAIL
            }
        });

        const mailOptions = {
            from: 'Mi empresa <williamortiz124554@gmail.com>',
            to: cliente?.correo,
            subject: `Tu Factura Electrónica ${num_factura}`,
            text: `Hola ${cliente?.razon_social || 'Cliente'}, adjunto encontrarás el PDF de tu factura comercial ${num_factura}.`,
            attachments: [{ filename: `${num_factura}.pdf`, content: pdfBuffer }]
        };

        transporter.sendMail(mailOptions)
            .then(() => console.log('Correo enviado con éxito'))
            .catch((mailError) => console.error("Error enviando el correo:", mailError));


        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${num_factura}.pdf"`);
        return res.status(201).send(pdfBuffer);

    } catch (error) {
        // El ROLLBACK solo actúa si la transacción seguía abierta
        await client.query("ROLLBACK").catch(() => {}); 
        console.error("Error general en postFactura:", error);

        return res.status(500).json({ error: "Error al procesar la factura" });
    }
}

export const getFacturas = async (req, res) => {
    try {
        const {id} = req.user
        const id_usuario = id
// 1. Traes todas las facturas generales (sin duplicados)
const { rows: facturas } = await client.query(
    "SELECT f.id_factura, c.razon_social as cliente, f.num_factura, u.nombre as comerciante FROM facturas f JOIN clientes c ON c.id_cliente = f.id_cliente JOIN usuarios u ON u.id_usuario = f.id_usuario WHERE f.id_usuario = $1 ORDER BY f.created_at DESC", 
    [id_usuario]);

// 2. Recorres cada factura para buscar sus materiales correspondientes
for (const factura of facturas) {
    const { rows: materiales } = await client.query(
        `SELECT
            p.nombre AS producto,
            pf.cantidad,
            pf.precio_venta
         FROM productos_facturados pf
         JOIN productos p ON p.id_producto = pf.id_producto
         WHERE pf.id_factura = $1`,
        [factura.id_factura]
    );

    factura.materiales = materiales;

    factura.total = materiales.reduce(
        (suma, producto) =>
            suma + producto.cantidad * Number(producto.precio_venta),
        0
    );
}
    // 3. Creas una nueva propiedad dentro de la factura y le metes la lista de materiales

// SELECT f.id_factura, c.razon_social as cliente, f.num_factura, u.nombre as comerciante, p.nombre as producto, pf.cantidad, pf.precio_venta FROM facturas f JOIN clientes c ON c.id_cliente = f.id_cliente JOIN usuarios u ON u.id_usuario = f.id_usuario JOIN productos_facturados pf ON pf.id_factura = f.id_factura JOIN productos p ON p.id_producto = pf.id_producto

res.json({ facturas });


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al procesar la factura" });
    }
}