import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        {
            token = req.headers.authorization.split(" ")[1];
        }
    }

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
        res.status(401).json({ message: "User no longer exists!" });
    }
    req.user = user; // Attach the user object to the request
    next();
}   catch (err) {
        res.status(401).json({ message: "Not authorized, token invalid" });
    }
};
