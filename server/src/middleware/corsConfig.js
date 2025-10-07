import cors from 'cors';

const corsOptions = {
  origin: function (origin, callback) {
    
    // Array of allowed origins
    const allowedOrigins = [
      process.env.CLIENT_ORIGIN,
    ];

    // Remove trailing slash of origin
    const normalizedOrigin = origin?.replace(/\/$/, '');

    // Allow if origin is in the list or if there's no origin (e.g., Postman or backend scripts)
    if (allowedOrigins.includes(normalizedOrigin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Origin not allowed by CORS'));
    }
  },
};

export default cors(corsOptions);