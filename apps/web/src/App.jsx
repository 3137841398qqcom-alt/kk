import { useState, useMemo, useCallback } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
import { useAudioContext } from "./context/AudioContext";
import Player from "./components/Player";
import Playlist from "./components/Playlist";
import SearchBar from "./components/SearchBar";
import SearchPage from "./components/SearchPage";
import LibraryPage from "./components/LibraryPage";
import QueuePanel from "./components/QueuePanel";
import "./App.css";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

function HomePage() {
  const { songs, play } = useAudioContext();
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
        <Player />
      </motion.div>

      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.15 }}>
        <QueuePanel />
      </motion.div>

      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.2 }}>
        <Playlist songs={filtered} onSelect={handleSelect} />
      </motion.div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/library" element={<LibraryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
