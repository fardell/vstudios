import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL no está definida en el runtime");
    return res.status(500).json({ error: "DATABASE_URL no configurada en Vercel" });
  }

  const sql = neon(dbUrl);

  if (req.method === "GET") {
    try {
      const rows = await sql`
        select
          nombre, precio, cantidad, categoria, subcategoria,
          fecha_elaboracion, fecha_vencimiento, empaque, presentacion,
          ingredientes, canton, provincia
        from productos
        order by nombre asc;
      `;
      return res.status(200).json({ rows });
    } catch (error) {
      console.error("Error consultando productos", error);
      return res.status(500).json({ error: "No se pudo obtener la lista de productos" });
    }
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, GET");
    return res.status(405).json({ error: "Metodo no permitido" });
  }

  const body = typeof req.body === "string"
    ? JSON.parse(req.body || "{}")
    : (req.body || {});

  const required = ["nombre", "precio", "cantidad", "categoria"];
  for (const field of required) {
    if (!body[field]) {
      return res.status(400).json({ error: `Falta el campo ${field}` });
    }
  }

  const precio = Number(body.precio);
  const cantidad = Number(body.cantidad);
  if (Number.isNaN(precio) || Number.isNaN(cantidad)) {
    return res.status(400).json({ error: "Precio y cantidad deben ser numericos" });
  }

  try {
    await sql`
      insert into productos (
        nombre, precio, cantidad, categoria, subcategoria,
        fecha_elaboracion, fecha_vencimiento, empaque, presentacion,
        ingredientes, canton, provincia
      ) values (
        ${body.nombre}, ${precio}, ${cantidad}, ${body.categoria}, ${body.subcategoria || null},
        ${body.elaboracion || null}, ${body.vencimiento || null}, ${body.empaque || null}, ${body.presentacion || null},
        ${body.ingredientes || null}, ${body.canton || null}, ${body.provincia || null}
      );
    `;
    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error("Error insertando producto", error);
    return res.status(500).json({ error: "No se pudo guardar el producto" });
  }
}