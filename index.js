import express from "express";
import { config } from "./dbconfig.js";
import userRoutes from "./routes/userRoutes.js";
import cancionRoutes from "./routes/cancionRoutes.js";

const app = express();
const PORT = 8000;

app.use(express.json());

app.use("/usuarios", userRoutes);
app.use("/canciones", cancionRoutes);

app.get("/", (req, res) => res.send("Hello World"));
app.get("/about", (req, res) => res.send("About route 🎉"));

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});