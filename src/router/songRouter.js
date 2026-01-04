// src/router/songRouter.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Song from "../model/song.js"; // <--- Thêm cái này để chạy chức năng Delete

// Import Controller
import { 
    getSongs, 
    getSongById, 
    getCommentsBySongId, 
    addSong,
    getHomeData,
    uploadSongs,
    updateCover,
    updateSongInfo
} from "../controllers/songController.js";

const songRouter = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- 1. CONFIG MULTER: LƯU NHẠC (Vào folder filemp3) ---
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // __dirname đang là src/router -> lùi 2 cấp ra root -> vào filemp3
    const dir = path.join(__dirname, "../../filemp3"); 
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Đặt tên: timestamp-random.mp3
    const ext = path.extname(file.originalname);
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  },
});
const uploadAudio = multer({ storage: audioStorage });

// --- 2. CONFIG MULTER: LƯU ẢNH (Vào folder images) ---
// Sửa lại đường dẫn này cho khớp với app.js (app.use('/images'...))
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../images"); // <--- QUAN TRỌNG: Lưu vào folder images
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  },
});
const uploadImage = multer({ storage: imageStorage });

// --- ROUTES (API) ---

// 1. Lấy dữ liệu (GET)
songRouter.get("/songs", getSongs);
songRouter.get("/song/:id", getSongById);
songRouter.get("/song/:id/comments", getCommentsBySongId);
songRouter.get("/songs/home", getHomeData); 

// 2. Upload & Thêm mới (POST)
// Upload nhiều file nhạc
songRouter.post("/upload", uploadAudio.array("files", 10), uploadSongs);

// Upload ảnh bìa cho 1 bài hát cụ thể
songRouter.post("/songs/:id/cover", uploadImage.single("cover"), updateCover);

// Thêm bài hát (Dùng Controller addSong, đã xóa đoạn code trùng lặp bên dưới)
songRouter.post("/songs", addSong); 

// 3. Cập nhật (PUT)
songRouter.put("/songs/:id", updateSongInfo);

// 4. Xóa bài hát (DELETE)
// Vì chưa có trong controller import nên giữ lại logic inline này
songRouter.delete('/songs/:id', async (req, res) => {
  try {
    // Xóa mềm (Soft delete)
    await Song.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.json({ message: "Song deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default songRouter;