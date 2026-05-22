import "dotenv/config";
import express from "express";
import cors from "cors";
import { existsSync, mkdirSync, readdirSync, statSync } from "fs";
import { join, extname, dirname } from "path";
import { fileURLToPath } from "url";
import SpotifyWebApi from "spotify-web-api-node";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ── Spotify client ──────────────────────────────────────────
let spotify = null;
function getSpotify() {
  if (spotify) return spotify;
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) {
    console.warn("Spotify credentials not set — streaming APIs disabled");
    return null;
  }
  spotify = new SpotifyWebApi({ clientId: id, clientSecret: secret });
  spotify.clientCredentialsGrant().then((d) => {
    spotify.setAccessToken(d.body.access_token);
    const ttl = (d.body.expires_in || 3600) * 1000;
    setInterval(() => {
      spotify.clientCredentialsGrant().then((r) => spotify.setAccessToken(r.body.access_token));
    }, ttl - 60000);
  });
  return spotify;
}

// ── Local music ─────────────────────────────────────────────
const MUSIC_DIR = join(process.cwd(), "music");
if (!existsSync(MUSIC_DIR)) mkdirSync(MUSIC_DIR, { recursive: true });

app.get("/api/songs", (req, res) => {
  try {
    const exts = [".mp3", ".wav", ".flac", ".ogg", ".aac", ".m4a"];
    if (!existsSync(MUSIC_DIR)) return res.json([]);
    const files = readdirSync(MUSIC_DIR).filter((f) => exts.includes(extname(f).toLowerCase()));
    res.json(
      files.map((f) => {
        const p = join(MUSIC_DIR, f);
        const s = statSync(p);
        return { name: f, url: `/music/${f}`, size: s.size };
      }),
    );
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use("/music", express.static(MUSIC_DIR));

app.get("/api/songs/:filename", async (req, res) => {
  try {
    const fp = join(MUSIC_DIR, req.params.filename);
    if (!existsSync(fp)) return res.status(404).json({ error: "File not found" });
    const { parseFile } = await import("music-metadata");
    const m = await parseFile(fp);
    res.json({
      name: req.params.filename,
      title: m.common.title || req.params.filename,
      artist: m.common.artist || "Unknown Artist",
      album: m.common.album || "Unknown Album",
      duration: Math.round(m.common.duration || 0),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Spotify: Search ─────────────────────────────────────────
app.get("/api/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  const type = req.query.type || "track";
  if (!q) return res.status(400).json({ error: "Missing q" });
  const sp = getSpotify();
  if (!sp) return res.json({ [type + "s"]: [] });

  try {
    const r = await sp.search(q, [type], { limit: 20 });
    if (type === "artist") {
      return res.json({
        artists: (r.body.artists?.items || []).map((a) => ({
          id: a.id,
          name: a.name,
          genres: a.genres || [],
          followers: a.followers?.total || 0,
          image: a.images?.[0]?.url || null,
          popularity: a.popularity,
          spotifyUrl: a.external_urls?.spotify || null,
        })),
      });
    }
    if (type === "album") {
      return res.json({
        albums: (r.body.albums?.items || []).map((a) => ({
          id: a.id,
          name: a.name,
          type: a.album_type,
          releaseDate: a.release_date,
          totalTracks: a.total_tracks,
          artist: a.artists.map((ar) => ar.name).join(", "),
          cover: a.images?.[0]?.url || null,
          spotifyUrl: a.external_urls?.spotify || null,
        })),
      });
    }
    res.json({
      tracks: (r.body.tracks?.items || []).map((t) => ({
        id: t.id,
        name: t.name,
        title: t.name,
        artist: t.artists.map((a) => a.name).join(", "),
        artistId: t.artists[0]?.id || null,
        album: t.album.name,
        albumId: t.album.id,
        albumCover: t.album.images?.[0]?.url || null,
        duration: Math.round(t.duration_ms / 1000),
        previewUrl: t.preview_url,
        spotifyUrl: t.external_urls?.spotify || null,
        url: t.preview_url || t.external_urls?.spotify || "",
      })),
    });
  } catch (e) {
    console.error("Search error:", e.message);
    res.json({ [type + "s"]: [] });
  }
});

// ── Spotify: Albums ─────────────────────────────────────────
app.get("/api/albums/:id", async (req, res) => {
  const sp = getSpotify();
  if (!sp) return res.status(503).json({ error: "Spotify unavailable" });
  try {
    const r = await sp.getAlbum(req.params.id);
    const a = r.body;
    res.json({
      id: a.id,
      name: a.name,
      label: a.label,
      releaseDate: a.release_date,
      totalTracks: a.total_tracks,
      cover: a.images?.[0]?.url || null,
      artists: a.artists.map((ar) => ({ id: ar.id, name: ar.name })),
      tracks: a.tracks.items.map((t) => ({
        id: t.id,
        name: t.name,
        trackNumber: t.track_number,
        duration: Math.round(t.duration_ms / 1000),
        previewUrl: t.preview_url,
        artists: t.artists.map((ar) => ar.name).join(", "),
      })),
      copyrights: a.copyrights?.map((c) => c.text) || [],
      spotifyUrl: a.external_urls?.spotify || null,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Spotify: Artists ────────────────────────────────────────
app.get("/api/artists/:id", async (req, res) => {
  const sp = getSpotify();
  if (!sp) return res.status(503).json({ error: "Spotify unavailable" });
  try {
    const [ar, top, albs] = await Promise.all([
      sp.getArtist(req.params.id),
      sp.getArtistTopTracks(req.params.id, "US"),
      sp.getArtistAlbums(req.params.id, { limit: 10, album_group: "album,single" }),
    ]);
    res.json({
      id: ar.body.id,
      name: ar.body.name,
      genres: ar.body.genres || [],
      followers: ar.body.followers?.total || 0,
      popularity: ar.body.popularity,
      image: ar.body.images?.[0]?.url || null,
      spotifyUrl: ar.body.external_urls?.spotify || null,
      topTracks: top.body.tracks.map((t) => ({
        id: t.id,
        name: t.name,
        duration: Math.round(t.duration_ms / 1000),
        previewUrl: t.preview_url,
        album: t.album.name,
        albumCover: t.album.images?.[0]?.url || null,
      })),
      albums: albs.body.items.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.album_type,
        releaseDate: a.release_date,
        totalTracks: a.total_tracks,
        cover: a.images?.[0]?.url || null,
      })),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Spotify: Recommendations ────────────────────────────────
app.get("/api/recommendations", async (req, res) => {
  const sp = getSpotify();
  if (!sp) return res.json({ recommendations: [], seeds: {} });
  try {
    const opts = { limit: 20 };
    if (req.query.seed_tracks) opts.seed_tracks = req.query.seed_tracks.split(",").slice(0, 5);
    if (req.query.seed_artists) opts.seed_artists = req.query.seed_artists.split(",").slice(0, 5);
    if (req.query.seed_genres) opts.seed_genres = req.query.seed_genres.split(",").slice(0, 5);
    if (!opts.seed_tracks && !opts.seed_artists && !opts.seed_genres) {
      opts.seed_genres = ["pop", "rock", "electronic"];
    }
    const r = await sp.getRecommendations(opts);
    res.json({
      seeds: {
        tracks: opts.seed_tracks || [],
        artists: opts.seed_artists || [],
        genres: opts.seed_genres || [],
      },
      recommendations: r.body.tracks.map((t) => ({
        id: t.id,
        name: t.name,
        title: t.name,
        artist: t.artists.map((a) => a.name).join(", "),
        album: t.album.name,
        albumCover: t.album.images?.[0]?.url || null,
        duration: Math.round(t.duration_ms / 1000),
        previewUrl: t.preview_url,
        spotifyUrl: t.external_urls?.spotify || null,
        url: t.preview_url || t.external_urls?.spotify || "",
      })),
    });
  } catch (e) {
    res.json({ recommendations: [], seeds: {}, notice: e.message });
  }
});

// ── Spotify: Browse new releases ────────────────────────────
app.get("/api/browse/new-releases", async (req, res) => {
  const sp = getSpotify();
  if (!sp) return res.json({ albums: [] });
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const r = await sp.getNewReleases({ limit });
    res.json({
      albums: r.body.albums.items.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.album_type,
        releaseDate: a.release_date,
        totalTracks: a.total_tracks,
        artist: a.artists.map((ar) => ar.name).join(", "),
        cover: a.images?.[0]?.url || null,
        spotifyUrl: a.external_urls?.spotify || null,
      })),
    });
  } catch (e) {
    res.json({ albums: [] });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Spotify API: ${process.env.SPOTIFY_CLIENT_ID ? "configured" : "not configured"}`);
});
