import History from '../model/history.js';
import Song from '../model/song.js';

export const getListeningHistory = async (req, res) => {
  try {
    // 1. Lấy ID người dùng từ req.user (được gán từ middleware xác thực token)
    // Nếu chưa có middleware, bạn cần đảm bảo req.user._id tồn tại
    const userId = req.user?._id; 

    if (!userId) {
        return res.status(401).json({ message: "Chưa xác thực người dùng" });
    }

    // 2. Tìm lịch sử của User đó, loại bỏ các record đã xóa mềm (isDeleted)
    const history = await History.find({ user: userId, isDeleted: false })
      .populate({
        path: 'track', // QUAN TRỌNG: Tên field trong Schema là 'track'
        select: 'title imgUrl countPlay countLike uploader', // Chỉ lấy các field cần thiết
        populate: { path: 'uploader', select: 'username' } // Lấy tên người upload
      })
      .sort({ listenedAt: -1 }) // Mới nghe nhất lên đầu
      .limit(20) // Lấy 20 bài gần nhất
      .lean();

    // 3. Format dữ liệu trả về cho Frontend
    const formattedData = history.map(item => {
      // item.track chứa thông tin bài hát (do đã populate)
      const song = item.track;
      
      // Nếu bài hát gốc bị xóa khỏi database, bỏ qua
      if (!song) return null;

      return {
        historyId: item._id, // ID của dòng lịch sử
        _id: song._id,       // ID của bài hát (để play nhạc)
        title: song.title,
        imgUrl: song.imgUrl,
        uploader: {
            username: song.uploader?.username || "Unknown"
        },
        countPlay: song.countPlay,
        countLike: song.countLike,
        listenedAt: item.listenedAt
      };
    }).filter(item => item !== null); // Lọc bỏ các giá trị null

    res.status(200).json(formattedData);

  } catch (error) {
    console.error("❌ LỖI HISTORY:", error);
    res.status(500).json({ message: "Lỗi Server khi lấy lịch sử" });
  }
};