import * as userService from "../services/userService.js";

export const createUser = async (req, res) => {
  await userService.createUser(req, res);
};

export const login = async (req, res) => {
  await userService.login(req, res);
};

export const escucho = async (req, res) => {
  await userService.escucho(req, res);
};
