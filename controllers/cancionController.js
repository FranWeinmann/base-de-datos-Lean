import * as cancionService from "../services/cancionService.js";

export const getCanciones = async (req, res) => {
  await cancionService.getCanciones(req, res);
};

export const createCancion = async (req, res) => {
  await cancionService.createCancion(req, res);
};

export const updateCancion = async (req, res) => {
  await cancionService.updateCancion(req, res);
};

export const deleteCancion = async (req, res) => {
  await cancionService.deleteCancion(req, res);
};
