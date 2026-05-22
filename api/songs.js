import { readFileSync, existsSync } from "fs";
import { join } from "path";

const SONGS_FILE = join(process.cwd(), "songs.json");

export default function handler(req, res) {
  try {
    if (!existsSync(SONGS_FILE)) {
      return res.json([]);
    }
    const data = readFileSync(SONGS_FILE, "utf-8");
    const songs = JSON.parse(data);
    res.json(songs);
  } catch {
    res.json([]);
  }
}
