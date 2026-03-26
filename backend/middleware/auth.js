const jwt = require("jsonwebtoken");
const users = require("../data/users");

const JWT_SECRET = process.env.JWT_SECRET || "CHANGE_THIS_SECRET";

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token is missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = users.find((u) => u.id === payload.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token verification failed" });
  }
}

module.exports = {
  authenticateToken,
  JWT_SECRET,
};