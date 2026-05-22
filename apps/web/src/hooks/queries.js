import { useQuery } from "@tanstack/react-query";

export function useSongsQuery() {
  return useQuery({
    queryKey: ["songs"],
    queryFn: async () => {
      const res = await fetch("/api/songs");
      if (!res.ok) throw new Error("Failed to fetch songs");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: [],
    initialData: [],
  });
}

export function useSearchQuery(q, type = "track") {
  return useQuery({
    queryKey: ["search", type, q],
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${type}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: q.trim().length > 0,
    staleTime: 2 * 60 * 1000,
    placeholderData: () => ({ [type + "s"]: [] }),
  });
}

export function useNewReleasesQuery(limit = 12) {
  return useQuery({
    queryKey: ["new-releases", limit],
    queryFn: async () => {
      const res = await fetch(`/api/browse/new-releases?limit=${limit}`);
      if (!res.ok) throw new Error("New releases failed");
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
    placeholderData: () => ({ albums: [] }),
  });
}

export function useRecommendationsQuery(seeds = {}) {
  const params = new URLSearchParams();
  if (seeds.tracks) params.set("seed_tracks", seeds.tracks);
  if (seeds.artists) params.set("seed_artists", seeds.artists);
  if (seeds.genres) params.set("seed_genres", seeds.genres);
  const qs = params.toString();

  return useQuery({
    queryKey: ["recommendations", seeds],
    queryFn: async () => {
      const res = await fetch(`/api/recommendations${qs ? "?" + qs : ""}`);
      if (!res.ok) throw new Error("Recommendations failed");
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
    placeholderData: () => ({
      recommendations: [],
      seeds: { tracks: [], artists: [], genres: [] },
    }),
  });
}
