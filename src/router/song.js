// Viet cac cau lenh get, post, put, delete
import express from "express";
import { getSongs } from "../controllers/song";
const songRouter = express.Router();

songRouter.get("/songs", getSongs);
// songRouter.get("/song/:slug", (req, res) => {
//     console.log("slug", req.params.slug);
    
// });
// songRouter.post("/song/", (req, res) => {
//     console.log("body", req.body);
    
// });
// songRouter.put("/song", (req, res) => {
//     res.send("Hello World!");
// });
// songRouter.delete("/song", (req, res) => {
//     res.send("Hello World!");
// });

export default songRouter;