import express from "express";
import dotenv from "dotenv";
import cors from "cors"; 
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Routers
import songRouter from "./router/songRouter.js";
import historyRouter from "./router/historyRouter.js"; // ✅ Cần import cái này
import homeRouter from "./router/homeRouter.js";
import searchRouter from "./router/searchRouter.js";
import userRouter from "./router/userRouter.js";
import commentRouter from "./router/commentRouter.js";
import authRouter from "./router/authRouter.js";
import libraryRouter from "./router/libraryRouter.js";
import followRouter from "./router/followRouter.js";
import { connectDB } from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();


app.use(express.json()); 

// Connect to MongoDB
connectDB(process.env.MONGO_URI);

app.use(cors());

// === KHAI BÁO ROUTERS ===
app.use("/api", songRouter);
app.use("/api", homeRouter);
app.use("/api", commentRouter);
app.use("/api", authRouter);

// ✅ Router User: Chứa các route /api/user/... và /api/users/...
app.use("/api", userRouter); 

// ✅ Router History: Chứa route POST /api/history (Để lưu khi nghe nhạc)
app.use("/api", historyRouter);

app.use("/api", libraryRouter);
app.use("/api/follow", followRouter);
app.use('/api', searchRouter);

// Static files
app.use('/track', express.static(path.join(__dirname, '../filemp3')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 👉 Chỉ listen khi chạy production (Render)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
