import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebHooks from "./controllers/clerkWebHooks.controller.js";

// Initialize the database connection
connectDB();

const app = express();
app.use(cors()); // Enable Cross-Origin Resource Sharing

// --- WEBHOOK BODY PARSING FIX ---
// Clerk webhooks require the raw body buffer for Svix signature verification.
// We must conditionally apply the standard JSON parser to all routes *except* the webhook route.

app.use((req, res, next) => {
  // Check if the request path is the Clerk webhook route
  if (req.originalUrl === "/api/clerk") {
    // Skip the standard JSON body parser for the webhook route
    next();
  } else {
    // Apply standard express.json() middleware for all other API routes
    express.json()(req, res, next);
  }
});
// ----------------------------------

// Apply Clerk middleware to protect other routes
app.use(clerkMiddleware());

// API to listen to Clerk WebHooks
// We use express.raw() here to ensure the RAW body (as a Buffer) is available on req.body
// for Svix verification in the controller.
app.post(
  "/api/clerk",
  express.raw({ type: "application/json" }),
  clerkWebHooks
);

// Example root route
app.get("/", (req, res) => res.send("API is working"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
