import { getSpotifyClient } from "../lib/spotify.js";

export default async function handler(req, res) {
  const id = req.query.id || "";
  if (!id) {
    return res.status(400).json({ error: "Missing album id" });
  }

  try {
    const spotify = getSpotifyClient();
    const result = await spotify.getAlbum(id);
    const a = result.body;
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
  } catch (err) {
    console.error("Album error:", err.message);
    res.status(500).json({ error: "Album fetch failed", detail: err.message });
  }
}
