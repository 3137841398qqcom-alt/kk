import { readFileSync, existsSync } from "fs";
import { join } from "path";

const SONGS_FILE = join(process.cwd(), "songs.json");

export default function handler(req, res) {
  try {
    const name = decodeURIComponent(req.query.name || req.url.split("/").pop() || "");
    if (!existsSync(SONGS_FILE)) {
      return res.status(404).json({ error: "No songs data" });
    }
    const data = readFileSync(SONGS_FILE, "utf-8");
    const songs = JSON.parse(data);
    const song = songs.find((s) => s.name === name);
    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }
    res.json(song);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
}
