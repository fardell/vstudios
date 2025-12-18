import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Metodo no permitido' });
  }

  const body = typeof req.body === 'string'
    ? JSON.parse(req.body || '{}')
    : (req.body || {});

  const required = ['nombre', 'precio', 'cantidad', 'categoria'];
  for (const field of required) {
    if (!body[field]) {
      return res.status(400).json({ error: `Falta el campo ${field}` });
    }
  }

  const precio = Number(body.precio);
  const cantidad = Number(body.cantidad);
  if (Number.isNaN(precio) || Number.isNaN(cantidad)) {
    return res.status(400).json({ error: 'Precio y cantidad deben ser numericos' });
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
    console.error('Error insertando producto', error);
    return res.status(500).json({ error: 'No se pudo guardar el producto' });
  }
}
