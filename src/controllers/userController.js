import User from "../model/user.js";
import jwt from "jsonwebtoken";
import Song from "../model/song.js";
import Favorite from "../model/favorite.js";
import Playlist from "../model/playlist.js";
import History from "../model/history.js";
import fs from "fs";
import path from "path";

// Check username availability
export const checkUsername = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        statusCode: 400,
        message: "username is required",
        data: null
      });
    }

    const user = await User.findOne({ username, isDeleted: false });

    return res.status(200).json({
      statusCode: 200,
      message: "Check username success",
      data: { exists: !!user }
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      message: err.message,
      data: null
    });
  }
};

// Đăng ký
export const register = async (req, res) => {
  try {
    const { username, password, name } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({
        statusCode: 400,
        message: "username, password, name are required",
        data: null
      });
    }

    // Check if username already exists
    const existing = await User.findOne({ username, isDeleted: false });
    if (existing) {
      return res.status(409).json({
        statusCode: 409,
        message: "Username already exists",
        data: null
      });
    }

    const user = await User.create({
      username,
      password,
      name
    });

    return res.status(201).json({
      statusCode: 201,
      message: "Register success",
      data: user
    });

  } catch (err) {


    return res.status(400).json({
      statusCode: 400,
      message: err.message,
      data: null
    });
  }
};

// Đăng nhập
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        statusCode: 400,
        message: "username and password are required",
        data: null
      });
    }

    const user = await User.findOne({ username, isDeleted: false });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
        data: null
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        statusCode: 401,
        message: "Wrong password",
        data: null
      });
    }

    // Sign JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({
        statusCode: 500,
        message: "JWT_SECRET not configured",
        data: null
      });
    }

    const accessToken = jwt.sign({ id: user._id, username: user.username, role: user.role }, secret, { expiresIn: '1d' });

    return res.status(200).json({
      statusCode: 200,
      message: "Login success",
      data: {
        user: {
          _id: user._id,
          username: user.username,
          imgUrl: user.imgUrl,
          name: user.name,
          role: user.role
        },
        accessToken
      }
    });

  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      message: err.message,
      data: null
    });
  }
};

// Lấy thông tin user hiện tại (protected)
export const me = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        statusCode: 401,
        message: "Unauthorized",
        data: null
      });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
        data: null
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Get user data success",
      data: { 
        user: {
          _id: user._id,
          username: user.username,
          imgUrl: user.imgUrl,
          name: user.name,
          role: user.role
        } }
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      message: err.message,
      data: null
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        message: "Unauthorized",
        data: null
      });
    }

    const [uploadedCount, favoriteCount, playlistCount, user] = await Promise.all([
      Song.countDocuments({ uploader: userId, isDeleted: false }),
      Favorite.countDocuments({ user: userId, isDeleted: false }),
      Playlist.countDocuments({ user: userId, isDeleted: false }),
      User.findById(userId).select("createdAt")
    ]);

    const createdAt = user?.createdAt ? new Date(user.createdAt).getTime() : Date.now();
    const daysSinceCreated = Math.floor((Date.now() - createdAt) / 86400000);

    return res.status(200).json({
      statusCode: 200,
      message: "Get user stats success",
      data: {
        uploadedCount,
        favoriteCount,
        playlistCount,
        daysSinceCreated,
        followedCount: 0
      }
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      message: err.message,
      data: null
    });
  }
};

export const getUserLikedSongs = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        message: "Unauthorized",
        data: null
      });
    }

    const favorites = await Favorite.find({ user: userId, isDeleted: false})
      .populate({
        path: "track",
        populate: { path: "uploader", select: "name" }
      })
      .sort({ likedAt: -1 });

    const songs = favorites
      .filter(f => !!f.track)
      .map(f => ({
        id: f.track._id,
        title: f.track.title,
        artistId: f.track.uploader?._id || f.track.uploader,
        artistName: f.track.uploader?.name || undefined,
        image: f.track.imgUrl,
        likes: f.track.countLike,
        plays: f.track.countPlay,
        likedAt: f.likedAt
      }));

    return res.status(200).json({
      statusCode: 200,
      message: "Get user liked songs success",
      data: { songs }
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      message: err.message,
      data: null
    });
  }
};

export const getUserPlaylists = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        message: "Unauthorized",
        data: null
      });
    }

    const playlists = await Playlist.find({ user: userId, isDeleted: false }).sort({ createdAt: -1 });
    return res.status(200).json({
      statusCode: 200,
      message: "Get user playlists successful",
      data: playlists
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      message: err.message,
      data: null
    });
  }
};



/* ================= GET HISTORY (Lấy lịch sử nghe của User) ================= */
// Hàm này được merge từ nhánh conflict và đổi tên cho đúng chức năng
export const getListeningHistory = async (req, res) => {
  try {
    // 1. Lấy ID user từ token
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Vui lòng đăng nhập để xem lịch sử." });
    }

    // 2. Tìm dữ liệu lịch sử
    const history = await History.find({ user: userId, isDeleted: false })
      .populate({
        path: 'track', 
        select: 'title imgUrl countPlay countLike uploader trackUrl', 
        populate: { 
          path: 'uploader', 
          select: 'username' 
        }
      })
      .sort({ listenedAt: -1 })
      .limit(20)
      .lean();

    // 3. Xử lý dữ liệu trả về
    const formattedData = history.map(item => {
      const song = item.track;

      if (!song) return null;

      return {
        historyId: item._id,
        _id: song._id,
        title: song.title,
        artist: song.uploader?.username || "Unknown Artist",
        imgUrl: song.imgUrl || "",
        trackUrl: song.trackUrl,
        countPlay: song.countPlay || 0,
        countLike: song.countLike || 0,
        listenedAt: item.listenedAt
      };
    }).filter(item => item !== null);

    res.status(200).json(formattedData);

  } catch (error) {
    console.error("Lỗi lấy lịch sử nghe:", error);
    res.status(500).json({ message: "Lỗi Server khi lấy lịch sử nghe" });
  }
};

export const getUserHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        message: "Unauthorized",
        data: null
      });
    }

    const items = await History.find({ user: userId, isDeleted: false })
      .populate({
        path: "track",
        populate: { path: "uploader", select: "name" }
      })
      .sort({ listenedAt: -1 });

    // Build a set of liked track ids for this user
    const favorites = await Favorite.find({ user: userId, isDeleted: false }).select("track");
    const likedSet = new Set(favorites.map(f => String(f.track)));

    const songs = items
      .filter(h => !!h.track)
      .map(h => ({
        id: h.track._id,
        title: h.track.title,
        artistId: h.track.uploader?._id || h.track.uploader,
        artistName: h.track.uploader?.name || undefined,
        image: h.track.imgUrl,
        likes: h.track.countLike,
        plays: h.track.countPlay,
        listenedAt: h.listenedAt,
        countPlay: h.track.countPlay,
        countLike: h.track.countLike,
        liked: likedSet.has(String(h.track._id))
      }));

    return res.status(200).json({
      statusCode: 200,
      message: "Get user history success",
      data: { songs }
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      message: err.message,
      data: null
    });
  }
};

export const getPublicUser = async (req, res) => {
  try {
    const id = req.params.id || req.user?.id;
    if (!id) {
      return res.status(400).json({
        statusCode: 400,
        message: "User id is required",
        data: null
      });
    }

    const user = await User.findById(id).select("_id username name imgUrl role createdAt");
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
        data: null
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Get public user success",
      data: { user }
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      message: err.message,
      data: null
    });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    const userId = req.user?.id;
    const targetId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (userId.toString() !== targetId.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // delete old avatar
    if (user.imgUrl && user.imgUrl !== "default_avatar.png") {
      try {
        const oldPath = path.join("images", "avatar", user.imgUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (e) {
        console.warn("Delete old avatar failed:", e.message);
      }
    }

    user.imgUrl = req.file.filename;
    await user.save();

    res.json({
      message: "Avatar updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        imgUrl: user.imgUrl
      }
    });
  } catch (err) {
    console.error("updateAvatar error:", err);
    res.status(500).json({ message: err.message });
  }
};
export const getAllUsers = async (req, res) => {
    try {
        // Tạm bỏ check admin để test trước
        // if (req.user.role !== 'admin') return res.status(403).json({ message: "Forbidden" });

        const users = await User.find({ isDeleted: false })
            .select('-password') // Bỏ qua mật khẩu
            .sort({ createdAt: -1 });

        return res.status(200).json({
            statusCode: 200,
            message: "Success",
            data: users 
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// 2. Tạo User mới từ Admin
export const createUser = async (req, res) => {
    try {
        const { username, password, name, role } = req.body;
        const exist = await User.findOne({ username, isDeleted: false });
        if(exist) return res.status(400).json({ message: "Username đã tồn tại" });

        const newUser = await User.create({
            username, 
            password, // Lưu ý: Cần mã hóa password nếu dự án có dùng bcrypt
            name, 
            role: role || 'user',
            imgUrl: "default_avatar.png"
        });
        res.status(201).json({ message: "Tạo thành công", data: newUser });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// 3. Cập nhật User
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, password } = req.body;
        let updateData = { name, role };
        
        // Chỉ update password nếu có nhập
        if(password && password.trim() !== "") updateData.password = password;

        const updated = await User.findByIdAndUpdate(id, updateData, { new: true });
        res.json({ message: "Update thành công", data: updated });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// 4. Xóa User
export const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isDeleted: true });
        res.json({ message: "Đã xóa user" });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};
