import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  register,
  login,
  checkUsername,
  me,
  getUserStats,
  getUserLikedSongs,
  getUserPlaylists,
  getUserHistory, // Hàm lấy lịch sử cho trang cá nhân
  getListeningHistory, // Hàm lấy lịch sử (có thể dùng chung)
  getPublicUser,
  updateAvatar,
  getAllUsers, 
  createUser,
  updateUser,
  deleteUser
} from "../controllers/userController.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();

router.get("/stats", verifyToken, getUserStats);
router.get("/likes", verifyToken, getUserLikedSongs);
router.get("/playlists", verifyToken, getUserPlaylists);
router.get("/history", verifyToken, getUserHistory);
router.get("/user/public/:id", getPublicUser);


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
    cb(null, `avatar-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  },
});
const uploadAvatar = multer({ storage: avatarStorage });

/* ========================================================
   SỬA LẠI CÁC ROUTE ĐỂ KHỚP VỚI FRONTEND (/api/user/...)
======================================================== */

// --- 1. Auth & Public ---
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/users/check", checkUsername); 
router.get("/auth/me", verifyToken, me);

// --- 2. User Features (Cá nhân) ---
// ✅ SỬA: Thêm chữ "/user" vào trước để khớp với Frontend gọi /api/user/history
router.get("/user/history", verifyToken, getUserHistory); 
router.get("/user/stats", verifyToken, getUserStats);
router.get("/user/likes", verifyToken, getUserLikedSongs);
router.get("/user/playlists", verifyToken, getUserPlaylists);

// --- 3. ADMIN MANAGEMENT ---
// Route Admin giữ nguyên /users (số nhiều)
router.get("/users", verifyToken, getAllUsers);     
router.post("/users", verifyToken, createUser);     
router.put("/users/:id", verifyToken, updateUser);  
router.delete("/users/:id", verifyToken, deleteUser);


// --- C. NHÓM DYNAMIC (Có tham số :id - Phải đặt cuối cùng) ---

// 6. Upload Avatar
// Controller dùng req.user.id để check quyền sở hữu vs req.params.id
// Controller check req.file => Cần uploadAvatar.single("avatar")
router.put("/:id/avatar", verifyToken, uploadAvatar.single("avatar"), updateAvatar);

export default router;