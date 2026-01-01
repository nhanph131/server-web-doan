// src/controllers/historyController.js
import History from '../model/history.js'; 
import Song from '../model/song.js';
// import User from '../model/user.js'; // Không cần import User trừ khi bạn dùng nó trực tiếp

export const getListeningHistory = async (req, res) => {
  try {
    // 1. Lấy ID user từ token (đảm bảo request đã qua middleware xác thực)
    const userId = req.user?._id;

    if (!userId) {
        return res.status(401).json({ message: "Vui lòng đăng nhập để xem lịch sử." });
    }

    // 2. Tìm dữ liệu lịch sử
    const history = await History.find({ user: userId, isDeleted: false }) // Chỉ lấy của user hiện tại
      .populate({
        path: 'track', // QUAN TRỌNG: Trong Schema bạn đặt tên là 'track', không phải 'song_id'
        select: 'title imgUrl countPlay countLike uploader', // Chỉ lấy các trường cần dùng
        populate: { 
          path: 'uploader', // Từ Song -> User để lấy tên ca sĩ
          select: 'username' // Chỉ lấy username
        }
      })
      .sort({ listenedAt: -1 }) // Sắp xếp theo thời gian nghe (trong Schema là listenedAt)
      .limit(20) // Lấy 20 bài gần nhất (tăng lên 1 chút để danh sách đẹp hơn)
      .lean(); // Dùng lean() để convert Mongoose Document sang Object JS thuần (nhanh hơn)

    // 3. Xử lý dữ liệu trả về cho Frontend
    const formattedData = history.map(item => {
      const song = item.track; // Lấy dữ liệu bài hát từ field 'track'

      // Nếu bài hát đã bị xóa cứng khỏi database thì bỏ qua
      if (!song) return null;

      return {
        historyId: item._id,           // ID của dòng lịch sử (để xóa lịch sử nếu cần)
        _id: song._id,                 // ID của bài hát (quan trọng: Frontend player thường dùng _id)
        
        // Mapping dữ liệu hiển thị
        title: song.title,
        artist: song.uploader?.username || "Unknown Artist",
        imgUrl: song.imgUrl || "https://via.placeholder.com/150",
        
        // Format số lượng hiển thị
        countPlay: (song.countPlay || 0).toLocaleString(),
        countLike: (song.countLike || 0).toLocaleString(),
        
        // Thời gian nghe
        listenedAt: item.listenedAt
      };
    }).filter(item => item !== null); // Loại bỏ các giá trị null

    // 4. Trả về kết quả
    res.status(200).json(formattedData);

  } catch (error) {
    console.error("Lỗi lấy lịch sử nghe:", error);
    res.status(500).json({ message: "Lỗi Server khi lấy lịch sử nghe" });
  }
};