import pkg from "pg";
import { config } from "../dbconfig.js";

const { Client } = pkg;

export const getCanciones = async (req, res) => {
  const client = new Client(config);
  await client.connect();
  const result = await client.query("SELECT * FROM public.canciones");
  await client.end();
  res.json(result.rows);
};

export const createCancion = async (req, res) => {
  const { nombre, id } = req.body;
  if (!id || !nombre) return res.status(400).json({ message: "Faltan datos" });

  try {
    const client = new Client(config);
    await client.connect();
    const result = await client.query(
      "INSERT INTO canciones (nombre, id) VALUES ($1, $2) RETURNING *",
      [nombre, id]
    );
    await client.end();
    res.status(201).json({ message: "Canción creada exitosamente", cancion: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const updateCancion = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ message: "Debe enviar el nuevo nombre" });

  try {
    const client = new Client(config);
    await client.connect();
    const result = await client.query(
      "UPDATE canciones SET nombre = $1 WHERE id = $2 RETURNING *",
      [nombre, id]
    );
    await client.end();

    if (result.rowCount === 0) return res.status(404).json({ message: "Canción no encontrada" });

    res.json({ message: "Canción actualizada exitosamente", cancion: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const deleteCancion = async (req, res) => {
  const { id } = req.params;
  const client = new Client(config);
  await client.connect();
  const result = await client.query("DELETE FROM canciones WHERE id=$1 RETURNING *", [id]);
  await client.end();

  if (result.rowCount === 0) return res.status(404).json({ message: "Canción no encontrada" });

  res.json({ message: "Canción eliminada", deleted: result.rows[0] });
};
