import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { createPlaylist, getPlaylistTracks, updatePlaylistCover, updatePlaylist, deletePlaylist, addTrackToPlaylist, removeTrackFromPlaylist } from "../controllers/libraryController.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Multer storage for playlist covers: uploads/playlistcovers
const playlistCoverStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		const dir = path.join(__dirname, "../../uploads/playlistcovers");
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
		cb(null, dir);
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname);
		cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
	},
});
const uploadPlaylistCover = multer({ storage: playlistCoverStorage });

// Create a playlist
router.post("/library/playlists", verifyToken, createPlaylist);

// Get tracks of a playlist
router.get("/library/playlists/:id/tracks", verifyToken, getPlaylistTracks);

// Add track to a playlist
router.post("/library/playlists/:id/tracks", verifyToken, addTrackToPlaylist);
router.delete("/library/playlists/:id/tracks/:trackId", verifyToken, removeTrackFromPlaylist);

// Upload/update playlist cover
router.post(
	"/library/playlists/:id/cover",
	verifyToken,
	uploadPlaylistCover.single("cover"),
	updatePlaylistCover
);

// Update playlist info
router.put("/library/playlists/:id", verifyToken, updatePlaylist);

// Delete playlist
router.delete("/library/playlists/:id", verifyToken, deletePlaylist);

export default router;
