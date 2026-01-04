// src/controllers/songController.js
import Song from "../model/song.js";
import User from "../model/user.js"; 
import Comment from "../model/comment.js";

// ============================================================
// 🔽 PHẦN CODE CŨ (GET DATA)
// ============================================================

export const getSongs = async (req, res) => {
    try {
        const data = await Song.find().populate("uploader", "_id name roles role");
        res.status(200).json({
            statusCode: 200,
            message: "Get All Track",
            data: data
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSongById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Song.findById(id).populate("uploader", "_id name roles role");

        if (!data) {
            return res.status(404).json({
                statusCode: 404,
                message: "Song not found",
                data: null
            });
        }
        res.status(200).json({
            statusCode: 200,
            message: "Get Song Detail Success",
            data: data
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCommentsBySongId = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Comment.find({ track: id }).populate("user", "_id name imgUrl");
        res.status(200).json({
            statusCode: 200,
            message: "Get Comments Success",
            data: data
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getHomeData = async (req, res) => {
    try {
        // Lấy danh sách bài hát mới nhất (hoặc random tùy logic)
        const songs = await Song.find().sort({ createdAt: -1 }).limit(50);
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addSong = async (req, res) => {
    try {
        const data = await Song.create(req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============================================================
// 🔽 PHẦN CODE MỚI (UPLOAD, UPDATE, SEARCH)
// ============================================================

// Helper: Hàm bỏ dấu tiếng Việt
function normalizeText(str) {
    if (!str) return "";
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim();
}

// 2. Upload Audio (Xử lý nhiều file)
export const uploadSongs = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Không có file nào được tải lên" });
        }

        const songs = [];
        // TODO: Sau này có Auth thì thay bằng req.user._id
        const fakeUserId = "693d8f6d53bc79c243c10737"; 

        for (const f of req.files) {
            const baseName = f.originalname.replace(/\.[^/.]+$/, "");
            
            // --- QUAN TRỌNG: Thêm tiền tố /filemp3/ vào DB ---
            const trackPath = `/filemp3/${f.filename}`;

            const newSong = await Song.create({
                title: baseName,
                title_normalized: normalizeText(baseName),
                description: "Unknown Artist",
                category: "General",
                imgUrl: "", 
                trackUrl: trackPath, // Lưu đường dẫn đầy đủ
                uploader: fakeUserId,
                countLike: 0,
                countPlay: 0
            });
            songs.push(newSong);
        }

        res.status(201).json({ 
            statusCode: 201,
            message: "Upload thành công", 
            songs: songs 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Upload/Cập nhật Cover Image
export const updateCover = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Thiếu file ảnh" });
        
        // --- QUAN TRỌNG: Lưu vào folder images (khớp với router và app.js) ---
        const imgPath = `/images/${req.file.filename}`;

        const song = await Song.findByIdAndUpdate(
            req.params.id,
            { imgUrl: imgPath },
            { new: true }
        );

        res.status(200).json({ 
            message: "Cập nhật ảnh bìa thành công", 
            song: song 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Cập nhật thông tin bài hát (Title, Artist, Genre)
export const updateSongInfo = async (req, res) => {
    try {
        const { title, description } = req.body;
        const updateData = { ...req.body };

        if (title) updateData.title_normalized = normalizeText(title);
        if (description) updateData.description_normalized = normalizeText(description);

        const song = await Song.findByIdAndUpdate(req.params.id, updateData, { new: true });
        
        res.status(200).json({ 
            message: "Cập nhật thông tin thành công", 
            song: song 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Chức năng Search (Nếu bạn dùng searchRouter riêng thì hàm này có thể import vào đó)
export const searchSongs = async (req, res) => {
    try {
        const q = req.query.q?.trim();
        if (!q) return res.json({ songs: [] });

        const regex = new RegExp(q, "i"); 
        const keywordNormalized = normalizeText(q);
        const regexNorm = new RegExp(keywordNormalized, "i");

        const songs = await Song.find({
            $or: [
                { title: { $regex: regex } },
                { description: { $regex: regex } }, 
                { category: { $regex: regex } },
                { title_normalized: { $regex: regexNorm } }
            ]
        });

        res.json({ songs: songs }); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};