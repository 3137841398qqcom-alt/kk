import SpotifyWebApi from "spotify-web-api-node";

let spotifyApi = null;

export function getSpotifyClient() {
  if (spotifyApi) return spotifyApi;

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET environment variables");
  }

  spotifyApi = new SpotifyWebApi({ clientId, clientSecret });

  spotifyApi.clientCredentialsGrant().then(
    (data) => {
      spotifyApi.setAccessToken(data.body.access_token);
      const expiresIn = (data.body.expires_in || 3600) * 1000;
      // Refresh token 1 minute before expiry
      setTimeout(() => {
        spotifyApi.clientCredentialsGrant().then((d) => {
          spotifyApi.setAccessToken(d.body.access_token);
        });
      }, expiresIn - 60000);
    },
    (err) => {
      console.error("Spotify auth failed:", err.message);
      spotifyApi = null;
    },
  );

  return spotifyApi;
}
