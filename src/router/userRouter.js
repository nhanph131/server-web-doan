import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getUserLikedSongs,
  getUserPlaylists,
  getUserHistory,
  checkUsername,
  getListeningHistory,
  register,
  login,
  me,
  getUserStats,
  getPublicUser,
  updateAvatar
  
} from "../controllers/userController.js";
import { User } from '../model/user.js'; // Nhớ import model User của bạn
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// 2. Setup Middleware xác thực (Cần thiết vì controller dùng req.user)



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();

router.get("/stats", verifyToken, getUserStats);
router.get("/likes", verifyToken, getUserLikedSongs);
router.get("/playlists", verifyToken, getUserPlaylists);
router.get("/history", verifyToken, getUserHistory);
router.get("/public/:id", getPublicUser);


// 3. Config Multer (Để upload Avatar)
// Controller logic xóa ảnh cũ trong folder "images", nên ta phải lưu mới vào đó
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Từ src/router lùi ra root -> vào folder images
    const dir = path.join(__dirname, "../../images/avatar");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // Đặt tên file unique để tránh trùng
    cb(null, `avatar-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  },
});
const uploadAvatar = multer({ storage: avatarStorage });

/* ================= ĐỊNH NGHĨA ROUTE ================= */

// --- A. NHÓM PUBLIC (Không cần đăng nhập) ---

// 1. Đăng ký & Đăng nhập
router.post("/auth/register", register);
router.post("/auth/login", login);

// 2. Kiểm tra user tồn tại (Controller dùng req.query.username)
// Gọi: /api/users/check?username=abc
router.get("/users/check", checkUsername); 


// --- B. NHÓM PRIVATE (Cần đăng nhập - verifyToken) ---

// 3. Lấy thông tin chính mình
router.get("/auth/me", verifyToken, me);

// 4. Lấy lịch sử nghe nhạc
router.get("/users/history", verifyToken, getListeningHistory);

// 5. Lấy thống kê (số bài upload, playlist...)
router.get("/users/stats", verifyToken, getUserStats);


// --- C. NHÓM DYNAMIC (Có tham số :id - Phải đặt cuối cùng) ---

// 6. Upload Avatar
// Controller dùng req.user.id để check quyền sở hữu vs req.params.id
// Controller check req.file => Cần uploadAvatar.single("avatar")
router.put("/:id/avatar", verifyToken, uploadAvatar.single("avatar"), updateAvatar);



export default router;