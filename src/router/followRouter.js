import express from "express";
import { 
    followUser, 
    getFollowers, 
    getFollowing, 
    checkFollowStatus,
    getPublicFollowers,
    getPublicFollowing
} from "../controllers/followController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// === PRIVATE ROUTES (cần đăng nhập) ===
router.post("/", verifyToken, followUser);
router.get("/followers/:userId", verifyToken, getFollowers);
router.get("/following/:userId", verifyToken, getFollowing);
router.get("/status/:userId", verifyToken, checkFollowStatus);

// === PUBLIC ROUTES (không cần đăng nhập) ===
router.get("/public/followers/:userId", getPublicFollowers);
router.get("/public/following/:userId", getPublicFollowing);

export default router;
