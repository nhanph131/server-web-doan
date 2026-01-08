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

router.post("/:followingId", verifyToken, followUser);
router.get("/status/:userId", verifyToken, checkFollowStatus);
// === PRIVATE ROUTES (cần đăng nhập) ===
router.get("/followers/:userId", verifyToken, getFollowers);
router.get("/following/:userId", verifyToken, getFollowing);

// === PUBLIC ROUTES (không cần đăng nhập) ===
router.get("/public/followers/:userId", getPublicFollowers);
router.get("/public/following/:userId", getPublicFollowing);

export default router;
