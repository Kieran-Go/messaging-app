import express from 'express';
import corsMiddleware from './src/middleware/corsConfig.js';
import errorMiddleware from './src/middleware/errorHandler.js';
import routes from './src/index.js';
import prisma from './db/pool.js';
import 'dotenv/config';

// Initialize express
const app = express();

// Use CORS middleware
app.use(corsMiddleware);

// Middleware that enables parsing of raw json into req.body
app.use(express.json());

// Routes
app.use('/users', routes.users);
app.use('/friendships', routes.friendships);

// Error handling middleware
app.use(errorMiddleware);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => 
  console.log(`App listening on port ${port}`)
);

// Disconnect from DB on app closing
const shutdown = async () => {
  console.log("\nShutting down...");
  try {
    await prisma.$disconnect();
    console.log("Disconnected from database.");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
};
process.on("SIGINT", shutdown);   // Ctrl+C
process.on("SIGTERM", shutdown);  // kill command