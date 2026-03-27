const jwt = require("jsonwebtoken");
const users = require("../data/users");
const refreshTokens = require("../data/refreshTokens");

const ACCESS_SECRET = process.env.ACCESS_SECRET || "ACCESS_SECRET_CHANGE_THIS";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "REFRESH_SECRET_CHANGE_THIS";

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token is missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    const user = users.find((u) => u.id === payload.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;
    // Всегда берем роль из базы, чтобы изменение роли в админке тотчас применялось
    req.user = { ...userWithoutPassword, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token verification failed" });
  }
}

function generateAccessToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, ACCESS_SECRET, { expiresIn: "15m" });
}

function generateRefreshToken(user) {
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: "7d" });
  refreshTokens.push(refreshToken);
  return refreshToken;
}

function verifyRefreshToken(token) {
  try {
    const payload = jwt.verify(token, REFRESH_SECRET);
    const user = users.find((u) => u.id === payload.id);
    if (!user || !refreshTokens.includes(token)) {
      return null;
    }
    return user;
  } catch (err) {
    return null;
  }
}

function removeRefreshToken(token) {
  const index = refreshTokens.indexOf(token);
  if (index > -1) {
    refreshTokens.splice(index, 1);
  }
}

function checkRole(requiredRoles) {
  const roleHierarchy = { user: 1, seller: 2, admin: 3 };
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    if (!Array.isArray(requiredRoles)) {
      requiredRoles = [requiredRoles];
    }
    
    const userRoleLevel = roleHierarchy[req.user.role] || 0;
    const requiredRoleLevel = Math.min(...requiredRoles.map(r => roleHierarchy[r] || 0));
    
    console.log(`User: ${req.user.email}, Role: ${req.user.role} (level ${userRoleLevel}), Required: ${requiredRoles.join(',')} (min level ${requiredRoleLevel})`);
  
    if (userRoleLevel < requiredRoleLevel) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  removeRefreshToken,
  checkRole,
};