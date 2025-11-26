import mongoose from "mongoose";

const SongSchema = new mongoose.Schema({
    song_title: {
        type: String,
        required: true,
    },
    artist_id: {
        type: String,
        default: ""
    },
    album_id: {
        type: String,
    },
    genre_id: {
        type: String,
    },
    duration: {
        type: String,
    },
    file_path: {
        type: String,
    },
    cover_image: {
        type: String,
    },
    lyrics: {
        type: String,
    },
    release_date: {
        type: String,
    },
    views: {
        type: Number,
        default: 0,
    },
    likes: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true, 
    versionKey: false
});

export default mongoose.model("Song", SongSchema);
