import { getSpotifyClient } from "../lib/spotify.js";

export default async function handler(req, res) {
  try {
    const spotify = getSpotifyClient();
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const result = await spotify.getNewReleases({ limit });

    const albums = result.body.albums.items.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.album_type,
      releaseDate: a.release_date,
      totalTracks: a.total_tracks,
      artist: a.artists.map((ar) => ar.name).join(", "),
      cover: a.images?.[0]?.url || a.images?.[1]?.url || null,
      spotifyUrl: a.external_urls?.spotify || null,
    }));

    res.json({ albums });
  } catch (err) {
    console.error("New releases error:", err.message);
    res.status(200).json({ albums: [] });
  }
}
