import express from "express";
import cors from "cors";
import { existsSync, mkdirSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const MUSIC_DIR = join(process.cwd(), "music");

// Ensure music directory exists
if (!existsSync(MUSIC_DIR)) {
  mkdirSync(MUSIC_DIR, { recursive: true });
}

// Get all music files
app.get("/api/songs", (req, res) => {
  try {
    const audioExtensions = [".mp3", ".wav", ".flac", ".ogg", ".aac", ".m4a"];
    if (!existsSync(MUSIC_DIR)) {
      return res.json([]);
    }
    const files = readdirSync(MUSIC_DIR).filter((file) =>
      audioExtensions.includes(extname(file).toLowerCase()),
    );
    const songs = files.map((file) => {
      const filePath = join(MUSIC_DIR, file);
      const stats = statSync(filePath);
      return {
        name: file,
        path: `/music/${file}`,
        size: stats.size,
      };
    });
    res.json(songs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve music files statically
app.use("/music", express.static(MUSIC_DIR));

// Get song metadata (requires music-metadata package)
app.get("/api/songs/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = join(MUSIC_DIR, filename);
    if (!existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }
    const { parseFile } = await import("music-metadata");
    const metadata = await parseFile(filePath);
    const { title, artist, album, duration } = metadata.common;
    res.json({
      name: filename,
      title: title || filename,
      artist: artist || "Unknown Artist",
      album: album || "Unknown Album",
      duration: Math.round(duration || 0),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
