import jwt from "jsonwebtoken";
const secretKey = "TPLean4a$";

export const verifyToken = (req, res, next) => {
  let token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Token no proporcionado" });

  if (token.startsWith("Bearer ")) token = token.slice(7);

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token inválido", error: err.message });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "No hay usuario autenticado" });
  if (req.user.is_admin) return next();
  return res.status(403).json({ message: "Acceso denegado: se requiere rol admin" });
};
