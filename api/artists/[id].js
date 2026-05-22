import { getSpotifyClient } from "../lib/spotify.js";

export default async function handler(req, res) {
  const id = req.query.id || "";
  if (!id) {
    return res.status(400).json({ error: "Missing artist id" });
  }

  try {
    const spotify = getSpotifyClient();
    const [artistRes, topTracksRes, albumsRes] = await Promise.all([
      spotify.getArtist(id),
      spotify.getArtistTopTracks(id, "US"),
      spotify.getArtistAlbums(id, { limit: 10, album_group: "album,single" }),
    ]);

    const a = artistRes.body;
    res.json({
      id: a.id,
      name: a.name,
      genres: a.genres || [],
      followers: a.followers?.total || 0,
      popularity: a.popularity || 0,
      image: a.images?.[0]?.url || null,
      spotifyUrl: a.external_urls?.spotify || null,
      topTracks: topTracksRes.body.tracks.map((t) => ({
        id: t.id,
        name: t.name,
        duration: Math.round(t.duration_ms / 1000),
        previewUrl: t.preview_url,
        album: t.album.name,
        albumCover: t.album.images?.[0]?.url || null,
      })),
      albums: albumsRes.body.items.map((al) => ({
        id: al.id,
        name: al.name,
        type: al.album_type,
        releaseDate: al.release_date,
        totalTracks: al.total_tracks,
        cover: al.images?.[0]?.url || null,
      })),
    });
  } catch (err) {
    console.error("Artist error:", err.message);
    res.status(500).json({ error: "Artist fetch failed", detail: err.message });
  }
}
