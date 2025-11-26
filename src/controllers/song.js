// Viet cac phuong thuc get, post, put, delete
import Song from "../model/song";
export const getSongs = async (req, res) => {
    try {
        const data = await Song.find();
        if (data.length <= 0) {
            return res.status(404).json({message: "No products found"});
        }
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};
// export const getProductById = (req, res) => {
//     res.send("Hello World!");
// };
export const addSong = async (req, res) => {
    try {
        const data = await Product.create(req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};
