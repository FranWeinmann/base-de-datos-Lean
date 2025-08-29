import {config} from './dbconfig.js'
import express from "express";
import 'dotenv/config'
import bcryptp from 'bcrypt';

import pkg from 'pg'
const {Client} = pkg;

const app = express()
const PORT = 8000



app.get('/', (req, res) => {
  res.send('Hello World')
})

app.get('/about', (req, res) => {
  res.send('About route 🎉 ')
})

app.post('/createuser', async (req, res) => {
  const user = req.body;
  console.log("User data: ", user);
  if(!user.nombre || !user.userid || !user.password){
    return res.status(400).json({message: "Completa todos los campos"});
  }
  try {
    const client = new Client(config);
    await client.connect();
    const hashPad = await bcryptp.hash(user.password, 10);
    user.password = hashPad;
    let result = await client.query('INSERT INTO usuario VALUES ($1, $2, $3 returning *', [
      user.userid, user.nombre, user.password
    ]);
    await  client.end();
    console.log('User created: ', result.rowCount);
  }
})

app.get('/canciones', async (req, res) => {
  const client = new Client(config);
  await client.connect();
  let result = await client.query("select * from public.canciones");
  await client.end();
  console.log(result.rows);
  res.send(result.rows);
})

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
})