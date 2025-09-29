import pkg from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../dbconfig.js";

const { Client } = pkg;
const secretKey = "TPLean4a$";
const options = { expiresIn: "1h", issuer: "lean" };

export const createUser = async (req, res) => {
  const user = req.body;
  if (!user.nombre || !user.userid || !user.password) {
    return res.status(400).json({ message: "Completa todos los campos" });
  }

  try {
    const client = new Client(config);
    await client.connect();

    user.password = await bcrypt.hash(user.password, 10);

    const result = await client.query(
      "INSERT INTO usuario VALUES ($1, $2, $3, $4) RETURNING *",
      [user.userid, user.nombre, user.password, user.is_admin]
    );

    await client.end();
    res.status(201).json({ message: "Usuario creado exitosamente", user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const login = async (req, res) => {
  const { userid, password } = req.body;
  if (!userid || !password) {
    return res.status(400).json({ message: "Debe completar todos los campos" });
  }

  try {
    const client = new Client(config);
    await client.connect();

    const result = await client.query('SELECT * FROM usuario WHERE "ID"=$1', [userid]);
    await client.end();

    if (result.rowCount === 0) return res.status(404).json({ message: "Usuario no encontrado" });

    const dbUser = result.rows[0];
    const passOK = await bcrypt.compare(password, dbUser.Passsword);

    if (!passOK) return res.status(401).json({ message: "Clave inválida" });

    const token = jwt.sign(
      { id: dbUser.ID, username: dbUser.ID, is_admin: dbUser.is_admin },
      secretKey,
      options
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const escucho = async (req, res) => {
  const userId = req.user.id;
  const client = new Client(config);
  await client.connect();
  const query = `
    SELECT c.nombre, e.reproducciones
    FROM escucha e
    JOIN canciones c ON e.cancion = c.id
    WHERE e.usuario = $1
    ORDER BY e.reproducciones DESC;
  `;
  const result = await client.query(query, [userId]);
  await client.end();

  if (result.rowCount === 0) return res.status(404).json({ message: "No se encontraron canciones escuchadas" });

  res.status(200).json(result.rows);
};
