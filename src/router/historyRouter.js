import express from "express";
import { clearUserHistory, getListeningHistory, addSongToHistory } from "../controllers/historyController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const historyRouter = express.Router();

historyRouter.get("/history", getListeningHistory);

// Add song to history
historyRouter.post("/history/add/:songId", verifyToken, addSongToHistory);

// Clear authenticated user's history (soft delete)
historyRouter.delete("/history/clear", verifyToken, clearUserHistory);

export default historyRouter;