import jwt from 'jsonwebtoken';
import 'dotenv/config';
import newError from '../util/newError.js';

export default function verifyToken(req, res, next) {
    // Extract the Authorization header (format: "Bearer <token>")
    const authHeader = req.headers['authorization'];

    // If no Authorization header is present, deny access
    if (!authHeader) return next(newError("No token provided", 401));

    // Split the header and retrieve the token part
    // "Bearer abc.def.ghi" -> ["Bearer", "abc.def.ghi"]
    const token = authHeader.split(' ')[1];

    // Verify the token using the jwt secret
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return next(newError("Invalid or expired token", 401));
        
        // Attach decoded payload (e.g. user ID) to the request object
        // This makes user info available in the route handler
        req.user = decoded;

        // Token is valid, proceed to the next middleware or route
        next();
    });
}