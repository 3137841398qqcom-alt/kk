import { getSpotifyClient } from "./lib/spotify.js";

export default async function handler(req, res) {
  const q = (req.query.q || "").trim();
  const type = req.query.type || "track";

  if (!q) {
    return res.status(400).json({ error: "Missing query parameter: q" });
  }

  try {
    const spotify = getSpotifyClient();
    const result = await spotify.search(q, [type], { limit: 20 });

    if (type === "artist") {
      const artists = (result.body.artists?.items || []).map((a) => ({
        id: a.id,
        name: a.name,
        genres: a.genres || [],
        followers: a.followers?.total || 0,
        image: a.images?.[0]?.url || a.images?.[1]?.url || null,
        popularity: a.popularity || 0,
        spotifyUrl: a.external_urls?.spotify || null,
      }));
      return res.json({ artists });
    }

    if (type === "album") {
      const albums = (result.body.albums?.items || []).map((a) => ({
        id: a.id,
        name: a.name,
        type: a.album_type,
        releaseDate: a.release_date,
        totalTracks: a.total_tracks,
        artist: a.artists.map((ar) => ar.name).join(", "),
        cover: a.images?.[0]?.url || a.images?.[1]?.url || null,
        spotifyUrl: a.external_urls?.spotify || null,
      }));
      return res.json({ albums });
    }

    // Default: track
    const tracks = (result.body.tracks?.items || []).map((t) => ({
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
    }));
    res.json({ tracks });
  } catch (err) {
    console.error("Search error:", err.message);
    res.status(500).json({ error: "Search failed", detail: err.message });
  }
}
