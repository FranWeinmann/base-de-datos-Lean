import * as userService from "../services/userService.js";

export const createUser = async (req, res) => {
  const user = req.body;
  if (!user.nombre || !user.userid || !user.password) {
    return res.status(400).json({ message: "Completa todos los campos" });
  }
  await userService.createUser(req.body, res);
};

export const login = async (req, res) => {
  const { userid, password } = req.body;
  if (!userid || !password) {
    return res.status(400).json({ message: "Debe completar todos los campos" });
  }
  await userService.login(req.body, res);
};

export const escucho = async (req, res) => {
  await userService.escucho(req, res);
};
