import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Music, Disc, User, Clock } from "lucide-react";
import { useAudioContext } from "../context/AudioContext";
import { useNavigate } from "react-router-dom";
import { formatTime } from "@music-player/shared";

const TABS = [
  { key: "track", label: "Songs", icon: Music },
  { key: "album", label: "Albums", icon: Disc },
  { key: "artist", label: "Artists", icon: User },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("track");
  const [results, setResults] = useState({ tracks: [], albums: [], artists: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const { play, songs, currentSong } = useAudioContext();
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback(
    async (q) => {
      if (!q.trim()) {
        setResults({ tracks: [], albums: [], artists: [] });
        setSearched(false);
        return;
      }
      setLoading(true);
      setSearched(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${activeTab}`);
        const data = await res.json();
        setResults((prev) => ({ ...prev, [activeTab + "s"]: data[activeTab + "s"] || [] }));
      } catch {
        setResults((prev) => ({ ...prev, [activeTab + "s"]: [] }));
      }
      setLoading(false);
    },
    [activeTab],
  );

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const handleClear = () => {
    setQuery("");
    setResults({ tracks: [], albums: [], artists: [] });
    setSearched(false);
    inputRef.current?.focus();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (query.trim()) {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query)}&type=${tab}`)
        .then((r) => r.json())
        .then((data) => {
          setResults((prev) => ({ ...prev, [tab + "s"]: data[tab + "s"] || [] }));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  };

  const handlePlayTrack = (track) => {
    const idx = songs.findIndex((s) => s.name === track.name);
    if (idx >= 0) {
      play(idx);
    }
  };

  const data = results[activeTab + "s"] || [];

  return (
    <div className="search-page">
      <div className="search-page-header">
        <button className="search-back" onClick={() => navigate("/")}>
          <X size={20} />
        </button>
        <div className="search-page-input-wrap">
          <Search size={18} className="search-page-icon" />
          <input
            ref={inputRef}
            className="search-page-input"
            type="text"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={handleInput}
          />
          {query && (
            <button className="search-page-clear" onClick={handleClear}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="search-tabs">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`search-tab${activeTab === key ? " active" : ""}`}
            onClick={() => handleTabChange(key)}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="search-results">
        {!searched && <p className="search-placeholder">Search for songs, albums, or artists</p>}

        {loading && (
          <div className="search-loading">
            <div className="search-spinner" />
          </div>
        )}

        {!loading && searched && data.length === 0 && (
          <p className="search-empty">
            No {activeTab}s found for "{query}"
          </p>
        )}

        <AnimatePresence mode="wait">
          {!loading && data.length > 0 && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "track" && (
                <ul className="search-track-list">
                  {data.map((t, i) => (
                    <li
                      key={t.id || i}
                      className="search-track-item"
                      onClick={() => handlePlayTrack(t)}
                    >
                      <div className="search-track-cover">
                        {t.albumCover ? <img src={t.albumCover} alt="" /> : <Music size={20} />}
                      </div>
                      <div className="search-track-info">
                        <span className="search-track-name">{t.name}</span>
                        <span className="search-track-artist">{t.artist}</span>
                      </div>
                      <span className="search-track-duration">
                        {t.duration ? formatTime(t.duration) : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === "album" && (
                <div className="search-grid">
                  {data.map((a) => (
                    <div key={a.id} className="search-card">
                      <div className="search-card-cover">
                        {a.cover ? <img src={a.cover} alt={a.name} /> : <Disc size={48} />}
                      </div>
                      <span className="search-card-name">{a.name}</span>
                      <span className="search-card-sub">{a.artist}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "artist" && (
                <div className="search-grid">
                  {data.map((a) => (
                    <div key={a.id} className="search-card">
                      <div className={`search-card-cover artist${a.image ? "" : " placeholder"}`}>
                        {a.image ? <img src={a.image} alt={a.name} /> : <User size={48} />}
                      </div>
                      <span className="search-card-name">{a.name}</span>
                      <span className="search-card-sub">Artist</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
