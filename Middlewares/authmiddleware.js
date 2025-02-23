const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // console.log(req);
  const token = req.headers["x-auth-token"];
  // console.log(token);
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.email;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
