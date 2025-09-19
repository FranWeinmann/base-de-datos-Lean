import { config } from './dbconfig.js';
import express from "express";
import bcryptp from 'bcrypt';
import pkg from 'pg';
import jwt from 'jsonwebtoken';

const { Client } = pkg;

const app = express();
const PORT = 8000;
const payload = {
  id: 923,
  username: 'fran'
};
const secretKey = 'TPLean4a$';
const options = {
  expiresIn: '1h',
  issuer: 'lean'
};
const token = jwt.sign(payload, secretKey, options);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/about', (req, res) => {
  res.send('About route 🎉');
});

app.post('/createuser', async (req, res) => {
  const user = req.body;
  console.log("User data: ", user);
  if (!user.nombre || !user.userid || !user.password) {
    return res.status(400).json({ message: "Completa todos los campos" });
  }

  try {
    const client = new Client(config);
    await client.connect();

    const hashPad = await bcryptp.hash(user.password, 10);
    user.password = hashPad;

    let result = await client.query(
      'INSERT INTO usuario VALUES ($1, $2, $3) returning *',
      [user.userid, user.nombre, user.password]
    );

    await client.end();

    console.log('User created: ', result.rowCount);
    res.status(201).json({ message: "Usuario creado exitosamente", user: result.rows[0] });

  } catch (error) {
    console.error("Error creando usuario:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

app.post('/login', async (req, res) => {
  const user = req.body;

  if (!user.userid || !user.password) {
    return res.status(400).json({ message: 'Debe completar todos los campos' });
  }

  try {
    const client = new Client(config);
    await client.connect();

    let result = await client.query('SELECT * FROM usuario WHERE userid=$1', [user.userid]);

    await client.end();

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    let dbUser = result.rows[0];
    const passOK = await bcryptp.compare(user.password, dbUser.password);

    if (passOK) {
      const token = jwt.sign({ id: dbUser.id, username: dbUser.userid }, secretKey, options);
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Clave inválida' });
    }

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.get('/escucho', async (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.id;
    const client = new Client(config);
    await client.connect();
    const query = `
      SELECT c.titulo, e.reproducciones
      FROM escuchas e
      JOIN canciones c ON e.cancion_id = c.id
      WHERE e.user_id = $1
      ORDER BY e.reproducciones DESC;
    `;
    const result = await client.query(query, [userId]);
    await client.end();
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'No se encontraron canciones escuchadas para este usuario' });
    }
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error verificando el token:", err);
    res.status(500).json({ message: 'Error al procesar la solicitud', error: err.message });
  }
});

app.get('/canciones', async (req, res) => {
  const client = new Client(config);
  await client.connect();

  let result = await client.query("SELECT * FROM public.canciones");

  await client.end();
  console.log(result.rows);
  res.send(result.rows);
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
})