import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import useAudio from "./hooks/useAudio";
import Player from "./components/Player";
import Playlist from "./components/Playlist";
import SearchBar from "./components/SearchBar";
import "./App.css";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

function App() {
  const {
    songs,
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    metadata,
    loading,
    likes,
    play,
    togglePlay,
    playNext,
    playPrev,
    seek,
    setVolume,
    toggleLike,
    isLiked,
  } = useAudio();

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return songs;
    const q = query.toLowerCase();
    return songs.filter((s) => {
      const title = (s.title || s.name).toLowerCase();
      const artist = (s.artist || "").toLowerCase();
      const album = (s.album || "").toLowerCase();
      return title.includes(q) || artist.includes(q) || album.includes(q);
    });
  }, [songs, query]);

  // Map filtered index back to original song index
  const handleSelect = useCallback(
    (filteredIndex) => {
      const song = filtered[filteredIndex];
      const originalIndex = songs.findIndex((s) => s.name === song.name);
      play(originalIndex);
    },
    [filtered, songs, play],
  );

  return (
    <div className="app">
      <motion.header
        className="app-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="app-title">Music Player</h1>
      </motion.header>

      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.05 }}>
        <SearchBar onSearch={setQuery} />
      </motion.div>

      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.1 }}>
        <Player
          currentSong={currentSong}
          metadata={metadata}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          loading={loading}
          onTogglePlay={togglePlay}
          onNext={playNext}
          onPrev={playPrev}
          onSeek={seek}
          onVolumeChange={setVolume}
          isLiked={isLiked}
          onToggleLike={toggleLike}
        />
      </motion.div>

      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.2 }}>
        <Playlist
          songs={filtered}
          currentIndex={songs.indexOf(currentSong)}
          likes={likes}
          onSelect={handleSelect}
          onToggleLike={toggleLike}
        />
      </motion.div>
    </div>
  );
}

export default App;
