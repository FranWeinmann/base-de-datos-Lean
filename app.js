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
      'INSERT INTO usuario VALUES ($1, $2, $3, $4) returning *',
      [user.userid, user.nombre, user.password, user.is_admin]
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

    let result = await client.query('SELECT * FROM usuario WHERE "ID"=$1', [user.userid]);

    await client.end();

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    let dbUser = result.rows[0];
    const passOK = await bcryptp.compare(user.password, dbUser.Passsword);

  if (passOK) {
    const token = jwt.sign(
      { 
        id: dbUser.ID, 
        username: dbUser.ID, 
        is_admin: dbUser.is_admin
      },
      secretKey,
      options
    );
    res.json({ token });
  }

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.get('/escucho', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const client = new Client(config);
  await client.connect();
  const query = `
    SELECT c.titulo, e.reproducciones
    FROM escucha e
    JOIN canciones c ON e.cancion = c.id
    WHERE e.usuario = $1
    ORDER BY e.reproducciones DESC;
  `;
  const result = await client.query(query, [userId]);
  await client.end();

  if (result.rowCount === 0) {
    return res.status(404).json({ message: 'No se encontraron canciones escuchadas' });
  }
  res.status(200).json(result.rows);
});


function verifyToken(req, res, next){
    let token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido', error: err.message });
  }
}

function verifyAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'No hay usuario autenticado' });
  }

  if (req.user.is_admin) {
    return next(); 
  }

  return res.status(403).json({ message: 'Acceso denegado: se requiere rol admin' });
}

app.delete('/canciones/:id', verifyToken, verifyAdmin, async (req, res) => {
  const client = new Client(config);
  let id = req.params.id;
  await client.connect();
  const result = await client.query("DELETE FROM canciones WHERE id=$1 RETURNING *", [id]);
  await client.end();

  if (result.rowCount === 0) {
    return res.status(404).json({ message: 'Canción no encontrada' });
  }
  res.json({ message: 'Canción eliminada', deleted: result.rows[0] });
});

app.get('/canciones', async (req, res) => {
  const client = new Client(config);
  await client.connect();

  let result = await client.query("SELECT * FROM public.canciones");

  await client.end();
  console.log(result.rows);
  res.send(result.rows);
});

app.post('/canciones', async(req, res) => {
  const client = new Client(config);
  let { nombre, id } = req.body;

  if (!id || !nombre) {
    return res.status(400).json({ message: 'Faltan datos' });
  }
    try {
    await client.connect();
    const result = await client.query(
      'INSERT INTO canciones (nombre, id) VALUES ($1, $2) RETURNING *',
      [nombre, id]
    );
    await client.end();
    res.status(201).json({message: 'Canción creada exitosamente', cancion: result.rows[0]});
  } catch (error) {
    await client.end();
    console.error('Error creando canción:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

app.put('/canciones/:id', async (req, res) => {
  const client = new Client(config);
  const { id } = req.params;
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: 'Debe enviar el nuevo nombre' });
  }

  try {
    await client.connect();

    const result = await client.query(
      'UPDATE canciones SET titulo = $1 WHERE id = $2 RETURNING *',
      [nombre, id]
    );

    await client.end();

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Canción no encontrada' });
    }

    res.json({message: 'Canción actualizada exitosamente', cancion: result.rows[0]});
  } catch (error) {
    await client.end();
    console.error('Error actualizando canción:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});