import express from "express";
import songRouter from "./router/song";
import { connectDB } from "./config/db";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// middleware
app.use(express.json());

// Connect to MongoDB
connectDB(process.env.MONGO_URI);

// Router
app.use("/api", songRouter);



export const viteNodeApp = app;