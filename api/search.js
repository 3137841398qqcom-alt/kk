import { getSpotifyClient } from "./lib/spotify.js";

export default async function handler(req, res) {
  const q = (req.query.q || "").trim();
  if (!q) {
    return res.status(400).json({ error: "Missing query parameter: q" });
  }

  try {
    const spotify = getSpotifyClient();
    const result = await spotify.searchTracks(q, { limit: 20 });
    const tracks = result.body.tracks.items.map((t) => ({
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
    }));
    res.json(tracks);
  } catch (err) {
    console.error("Search error:", err.message);
    res.status(500).json({ error: "Search failed", detail: err.message });
  }
}
