import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") return res.status(401).json({ message: "Malformed token" });

    const token = parts[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: "JWT_SECRET not configured" });

    jwt.verify(token, secret, (err, decoded) => {
      if (err) return res.status(401).json({ message: "Invalid token" });
      req.user = decoded; 
      next();
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
