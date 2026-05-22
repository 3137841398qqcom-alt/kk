import { getSpotifyClient } from "./lib/spotify.js";

export default async function handler(req, res) {
  try {
    const spotify = getSpotifyClient();
    const options = { limit: 20 };

    // Accept optional seed params: ?seed_tracks=id1,id2&seed_artists=id1&seed_genres=pop,rock
    if (req.query.seed_tracks) {
      options.seed_tracks = req.query.seed_tracks.split(",").slice(0, 5);
    }
    if (req.query.seed_artists) {
      options.seed_artists = req.query.seed_artists.split(",").slice(0, 5);
    }
    if (req.query.seed_genres) {
      options.seed_genres = req.query.seed_genres.split(",").slice(0, 5);
    }

    // Fallback: if no seeds provided, use a default popular genre
    if (!options.seed_tracks && !options.seed_artists && !options.seed_genres) {
      options.seed_genres = ["pop", "rock", "electronic"];
    }

    // Spotify requires at least one seed, max 5 total seeds combined
    const result = await spotify.getRecommendations(options);
    const tracks = result.body.tracks.map((t) => ({
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

    res.json({
      seeds: {
        tracks: options.seed_tracks || [],
        artists: options.seed_artists || [],
        genres: options.seed_genres || [],
      },
      recommendations: tracks,
    });
  } catch (err) {
    console.error("Recommendations error:", err.message);
    res.status(200).json({
      seeds: { tracks: [], artists: [], genres: [] },
      recommendations: [],
      notice: "Recommendations unavailable — provide Spotify credentials or seed data",
    });
  }
}
