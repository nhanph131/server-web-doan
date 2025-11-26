# Backend Music Project

Đây là backend cho dự án Music, được xây dựng bằng Node.js, Express và MongoDB (sử dụng Vite).

## Yêu cầu hệ thống

- [Node.js](https://nodejs.org/) (Khuyến nghị phiên bản LTS)
- [MongoDB](https://www.mongodb.com/try/download/community) (Hoặc sử dụng MongoDB Atlas)

## Hướng dẫn cài đặt

Để chạy dự án này trên máy của bạn, hãy làm theo các bước sau:

1.  **Clone hoặc tải xuống project:**
    Giải nén file hoặc clone từ repository.

2.  **Cài đặt dependencies:**
    Mở terminal tại thư mục gốc của dự án và chạy:
    ```bash
    npm install
    ```

3.  **Cấu hình biến môi trường:**
    Tạo file `.env` tại thư mục gốc và thêm nội dung sau:
    ```env
    MONGO_URI=mongodb://localhost:27017/backendMusic
    ```
    *Lưu ý: Thay đổi `MONGO_URI` nếu bạn dùng MongoDB Atlas hoặc port khác.*

4.  **Chạy dự án:**
    Để chạy server ở chế độ development:
    ```bash
    npm run dev
    ```
    Server sẽ chạy tại `http://localhost:8080`.

## API Endpoints

Hiện tại hệ thống cung cấp các API sau:

### Songs
- **GET** `/api/songs`: Lấy danh sách bài hát.

## Cấu trúc thư mục

- `src/`
    - `config/`: Cấu hình database (`db.js`)
    - `controllers/`: Logic xử lý (`song.js`)
    - `model/`: Schema MongoDB (`song.js`)
    - `router/`: Định nghĩa routes (`song.js`)
    - `app.js`: Khởi tạo ứng dụng Express
- `vite.config.js`: Cấu hình Vite
