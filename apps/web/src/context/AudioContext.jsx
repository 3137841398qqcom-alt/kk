import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

const AudioContext = createContext(null);

const STORAGE_KEY = "music-player";

function loadStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota exceeded, ignore */
  }
}

export function AudioProvider({ children }) {
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const stored = loadStorage();
    return stored.volume ?? 0.7;
  });
  const [metadata, setMetadata] = useState({});
  const [loading, setLoading] = useState(false);
  const [likes, setLikes] = useState(() => loadStorage().likes || []);
  const [history, setHistory] = useState(() => loadStorage().history || []);
  const [queue, setQueue] = useState([]);

  const audioRef = useRef(new Audio());
  const playNextRef = useRef(null);
  const isAutoPlaying = useRef(false);
  const restoreTimeRef = useRef(null);

  const persist = useCallback((patch) => {
    const current = loadStorage();
    saveStorage({ ...current, ...patch });
  }, []);

  useEffect(() => {
    persist({ volume });
  }, [volume, persist]);
  useEffect(() => {
    persist({ likes });
  }, [likes, persist]);

  const loadSongs = useCallback(async () => {
    try {
      const res = await fetch("/api/songs");
      const data = await res.json();
      setSongs(data);
    } catch {
      setSongs([]);
    }
  }, []);

  const currentSong = songs[currentIndex] || null;

  const play = useCallback(
    async (index) => {
      if (index < 0 || index >= songs.length) return;
      setLoading(true);
      const song = songs[index];
      setMetadata({
        title: song.title || song.name,
        artist: song.artist || "Unknown Artist",
        album: song.album || "Unknown Album",
      });
      setCurrentIndex(index);
      audioRef.current.src = song.url;
      audioRef.current.load();

      setHistory((prev) => {
        const entry = {
          name: song.name || "",
          title: song.title || song.name || "",
          artist: song.artist || "",
          album: song.album || "",
          playedAt: Date.now(),
        };
        const filtered = prev.filter((h) => h.name !== entry.name);
        return [entry, ...filtered].slice(0, 50);
      });

      if (restoreTimeRef.current !== null && !isAutoPlaying.current) {
        const resumeTime = restoreTimeRef.current;
        audioRef.current.addEventListener("loadedmetadata", function resume() {
          if (audioRef.current) {
            audioRef.current.currentTime = resumeTime;
          }
          audioRef.current?.removeEventListener("loadedmetadata", resume);
        });
      }
      restoreTimeRef.current = null;

      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      setLoading(false);
    },
    [songs],
  );

  const playNext = useCallback(() => {
    if (songs.length === 0) return;
    isAutoPlaying.current = true;
    if (queue.length > 0) {
      const [next, ...rest] = queue;
      setQueue(rest);
      play(next);
    } else {
      const next = (currentIndex + 1) % songs.length;
      play(next);
    }
  }, [currentIndex, songs, play, queue]);

  const playPrev = useCallback(() => {
    if (songs.length === 0) return;
    const prev = (currentIndex - 1 + songs.length) % songs.length;
    play(prev);
    setIsPlaying(true);
  }, [currentIndex, songs, play]);

  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  const togglePlay = useCallback(() => {
    if (currentIndex === -1 && songs.length > 0) {
      play(0);
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  }, [isPlaying, currentIndex, songs, play]);

  const seek = useCallback((time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolumeLevel = useCallback((v) => {
    audioRef.current.volume = v;
    setVolume(v);
  }, []);

  const toggleLike = useCallback((trackName) => {
    setLikes((prev) => {
      if (prev.includes(trackName)) return prev.filter((n) => n !== trackName);
      return [...prev, trackName];
    });
  }, []);

  const isLiked = useCallback((trackName) => likes.includes(trackName), [likes]);

  const clearHistory = useCallback(() => setHistory([]), []);

  const addToQueue = useCallback((index) => {
    setQueue((prev) => [...prev, index]);
  }, []);

  const removeFromQueue = useCallback((queueIndex) => {
    setQueue((prev) => prev.filter((_, i) => i !== queueIndex));
  }, []);

  const clearQueue = useCallback(() => setQueue([]), []);

  // Save playback state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex >= 0 && songs[currentIndex]) {
        persist({
          lastSong: songs[currentIndex].name,
          lastIndex: currentIndex,
          lastTime: audioRef.current.currentTime,
        });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, songs, persist]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => playNextRef.current?.();
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.volume = volume;

    const stored = loadStorage();
    if (stored.lastIndex >= 0 && stored.lastTime > 0) {
      restoreTimeRef.current = stored.lastTime;
    }

    loadSongs();

    return () => {
      if (currentIndex >= 0) {
        persist({ lastTime: audio.currentTime, lastIndex: currentIndex });
      }
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    songs,
    currentSong,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    metadata,
    loading,
    likes,
    history,
    queue,
    loadSongs,
    play,
    togglePlay,
    playNext,
    playPrev,
    seek,
    setVolume: setVolumeLevel,
    toggleLike,
    isLiked,
    addToQueue,
    removeFromQueue,
    clearQueue,
    clearHistory,
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudioContext() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudioContext must be used within AudioProvider");
  return ctx;
}
