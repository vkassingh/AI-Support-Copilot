const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role)
    return res.status(403).json({ error: `Access denied. ${role} only.` });
  next();
};

module.exports = { auth, requireRole };
