import cors from 'cors';

// Array of allowed origins
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow if origin is in the list or if there's no origin (e.g., Postman or backend scripts)
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Origin not allowed by CORS'));
    }
  },
};

export default cors(corsOptions);