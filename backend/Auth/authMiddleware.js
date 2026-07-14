import jwt from 'jsonwebtoken';
import 'dotenv/config';
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

// Middleware to verify if user is logged in
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <TOKEN>
  if (!token) return res.status(401).json({ message: "Access Denied. No token provided." });
  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decodedUser) => {



    if (err) return res.status(403).json({ message: "Invalid or Expired Token" });
    req.user = decodedUser; // Contains { id, isAdmin }
    console.log(req.user);
    console.log("jwt verify", token, ACCESS_TOKEN_SECRET, req.user);
    next();
  });
};



const verifyAdmin = (req, res, next) => {
  // 1. Header la irunthu token edukka confirmed
  console.log("verfy admin");

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Access Denied. No token provided!" });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Token valid ah nu verify panrathu
    console.log(token, ACCESS_TOKEN_SECRET,);
    const verified = jwt.verify(token, ACCESS_TOKEN_SECRET);

    // 3. User data va req object la store panrom (for future use)
    req.user = verified;


    // 4. Token kulla irukura isAdmin true ah nu check panrom
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access Denied. Admin only route!" });
    }

    next(); // Everything OK, proceed to next function
  } catch (err) {
    console.log(err.message);

    res.status(400).json({ message: "Invalid Token!" });
  }
};



export { verifyToken, verifyAdmin };