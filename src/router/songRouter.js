// src/router/songRouter.js
import express from "express";
import { 
    getSongs, 
    getSongById, 
    addSong,
    likeSong, 
    unlikeSong,
    uploadSongs,
    updateCover,
    updateSongInfo,
    getSongsByUploader,
    deleteSong
} from "../controllers/songController.js";
import { getHomeData } from "../controllers/homeController.js"; 
import { verifyToken } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Song from "../model/song.js"; // Import model Song for line 89

const songRouter = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================
// 1. CONFIG MULTER (Nơi lưu file)
// ============================================================

// A. Lưu nhạc -> vào folder 'filemp3'
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Từ router lùi 2 cấp (src -> server) rồi vào filemp3
    const dir = path.join(__dirname, "../../filemp3"); 
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  },
});
const uploadAudio = multer({ storage: audioStorage });

// B. Lưu ảnh -> vào folder 'images' (Khớp với app.js)
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../images/imageTrack"); 
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  },
});
const uploadImage = multer({ storage: imageStorage });

// ============================================================
// 2. ROUTES (API)
// ============================================================

// --- GET Routes ---
songRouter.get("/songs", getSongs);
songRouter.get("/song/:id", getSongById);
songRouter.get("/songs/home", getHomeData); 
songRouter.post("/song/:id/like", verifyToken, likeSong);
songRouter.delete("/song/:id/like", verifyToken, unlikeSong);
// songRouter.get("/song/:slug", (req, res) => {
//     console.log("slug", req.params.slug);
    
// });
// songRouter.post("/song/", (req, res) => {
//     console.log("body", req.body);
    
// });
// songRouter.put("/song", (req, res) => {
//     res.send("Hello World!");
// });
// songRouter.delete("/song", (req, res) => {
//     res.send("Hello World!");
// });
songRouter.get("/user/:id/songs", getSongsByUploader); // API Matches: /api/user/:id/songs
// songRouter.get("/:id/songs", getSongsByUploader); // API Matches: /api/:id/songs

// --- UPLOAD Routes ---
// Upload nhiều file nhạc
songRouter.post("/upload", verifyToken, uploadAudio.array("files", 10), uploadSongs);

// Upload ảnh bìa (Cover) cho 1 bài hát
songRouter.post("/songs/:id/cover", uploadImage.single("cover"), updateCover);

// --- CRUD Routes ---
// Thêm bài hát (JSON only, nếu dùng form data thì dùng route upload trên)
songRouter.post("/songs", addSong); 

// Cập nhật thông tin bài hát (Title, Artist...)
songRouter.put("/songs/:id", updateSongInfo);

// Xóa bài hát (Xóa cả file vật lý và DB)
songRouter.delete("/songs/:id", deleteSong);

export default songRouter;