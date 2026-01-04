import express from "express";
import cors from "cors"; // Sửa lỗi chặn kết nối
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { connectDB } from "./config/db.js";

// Import các Router
import songRouter from "./router/songRouter.js";
import historyRouter from "./router/historyRouter.js";
import homeRouter from "./router/homeRouter.js";
import searchRouter from "./router/searchRouter.js"; // Sửa lỗi backend crash
import userRouter from "./router/userRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();

app.use(cors()); // Cho phép Frontend 8080 gọi vào
app.use(express.json());

connectDB(process.env.MONGO_URI);

// Router
app.use("/api", songRouter);
app.use('/api', homeRouter);
app.use('/api', historyRouter);
app.use('/api', searchRouter);
app.use("/api", userRouter);

// Static files
app.use('/filemp3', express.static(path.join(__dirname, '../filemp3')));
app.use('/images', express.static(path.join(__dirname, '../images')));

export const viteNodeApp = app;