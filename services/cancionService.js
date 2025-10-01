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

export const createCancion = async ({ id, nombre, album, duracion, reproducciones }, res) => {
  try {
    const client = new Client(config);
    await client.connect();
    const result = await client.query(
      "INSERT INTO canciones (id, nombre, album, duracion, reproducciones) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [id, nombre, album, duracion, reproducciones]
    );
    await client.end();
    res.status(201).json({ message: "Canción creada exitosamente", cancion: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error });
  }
};

export const updateCancion = async (id, nombre, res) => {
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

export const deleteCancion = async ({id}, res) => {
  const client = new Client(config);
  await client.connect();

  try {
    await client.query('DELETE FROM playlistdetalle WHERE id_cancion = $1', [id]);
    const result = await client.query('DELETE FROM canciones WHERE id = $1 RETURNING *', [id]);

    await client.end();

    if (result.rowCount === 0) return res.status(404).json({ message: "Canción no encontrada" });
    res.json({ message: "Canción eliminada", deleted: result.rows[0] });
  } catch (error) {
    await client.end();
    res.status(500).json({ message: "Error del servidor", error });
  }
};

export const escuchoCancion = async ({ id, idotro, userId }, res) => {
  try {
    const client = new Client(config);
    await client.connect();

    const { rows } = await client.query("SELECT reproducciones FROM canciones WHERE id = $1", [id]);
    if (rows.length === 0) {
      await client.end();
      return res.status(404).json({ message: "Canción no encontrada" });
    }

    const reproduccionesActuales = rows[0].reproducciones || 0;
    const result = await client.query(
      "INSERT INTO escucha (id, usuarioid, cancionid, reproducciones) VALUES ($1, $2, $3, $4) RETURNING *",
      [idotro, userId, id, reproduccionesActuales + 1]
    );
    await client.query("UPDATE canciones SET reproducciones = reproducciones + 1 WHERE id = $1", [id]);

    await client.end();
    res.status(201).json({ message: "Escucha registrada", escucha: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar escucha", error });
  }
};