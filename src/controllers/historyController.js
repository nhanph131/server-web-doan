import mongoose from "mongoose";
import History from "../model/history";
import Song from "../model/song";
import User from "../model/user";
import Comment from "../model/comment";

export const getHistory = async (req, res) => {
    try {
        // Lấy userId từ query params hoặc req.user (nếu có middleware auth)
        const userId = req.query.userId || req.user?._id;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const history = await History.find({ user: userId })
            .populate("track")
            .sort({ listenedAt: -1 })
            .limit(5);

        const result = await Promise.all(history.map(async (item) => {
            const song = item.track;
            if (!song) return null;

            let uploaderName = "Unknown Uploader";
            if (song.uploader && mongoose.Types.ObjectId.isValid(song.uploader)) {
                const uploader = await User.findById(song.uploader);
                if (uploader) {
                    uploaderName = uploader.name;
                }
            }
            
            const commentCount = await Comment.countDocuments({ track: song._id });

            return {
                id: song._id,
                artist: uploaderName,
                title: song.title,
                plays: song.countPlay ? song.countPlay.toLocaleString() : "0",
                likes: song.countLike ? song.countLike.toLocaleString() : "0",
                reposts: "0", 
                comments: commentCount.toLocaleString(),
                image: song.imgUrl
            };
        }));

        const filteredResult = result.filter(item => item !== null);

        return res.status(200).json(filteredResult);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
