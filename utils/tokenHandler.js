const jwt = require("jsonwebtoken");
require("dotenv").config;

const generateToken = (user) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  const accessToken = jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );
  const refreshToken = jwt.sign(
    { id: user._id, email: user.email, username: user.username },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
  const idToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
  return { accessToken, refreshToken, idToken };
};

module.exports = { generateToken };
