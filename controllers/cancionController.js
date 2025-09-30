import * as cancionService from "../services/cancionService.js";

export const getCanciones = async (req, res) => {
  await cancionService.getCanciones(req, res);
};

export const createCancion = async (req, res) => {
  const { id, nombre, album, duracion, reproducciones } = req.body;
  if (!id || !nombre || !album || !duracion || !reproducciones) {
    return res.status(400).json({ message: "Faltan datos" });
  }
  await cancionService.createCancion(req.body, res);
};

export const updateCancion = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ message: "Debe enviar el nuevo nombre" });
  if (!id) return res.status(400).json({ message: "Asegurese de que el ID sea correcto" });
  await cancionService.updateCancion(id, nombre, res);
};

export const deleteCancion = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Asegurese de que el ID sea correcto" });
  await cancionService.deleteCancion(req.params, res);
};
