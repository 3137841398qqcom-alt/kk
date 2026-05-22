import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart, Clock, ListMusic, X, Music, Play, Plus, Trash2 } from "lucide-react";
import { useAudioContext } from "../context/AudioContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TABS = [
  { key: "liked", label: "Liked Songs", icon: Heart },
  { key: "history", label: "Recently Played", icon: Clock },
  { key: "playlists", label: "Playlists", icon: ListMusic },
];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("liked");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [playlists, setPlaylists] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mp-playlists") || "[]");
    } catch {
      return [];
    }
  });

  const navigate = useNavigate();
  const { likes, history, songs, play, toggleLike, clearHistory } = useAudioContext();

  const likedSongs = songs.filter((s) => likes.includes(s.name));

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const id = Date.now().toString(36);
    const updated = [...playlists, { id, name, tracks: [], createdAt: Date.now() }];
    setPlaylists(updated);
    localStorage.setItem("mp-playlists", JSON.stringify(updated));
    setNewName("");
    setShowCreate(false);
  };

  const handleDeletePlaylist = (id) => {
    const updated = playlists.filter((p) => p.id !== id);
    setPlaylists(updated);
    localStorage.setItem("mp-playlists", JSON.stringify(updated));
  };

  const formatDate = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="search-page">
      <div className="search-page-header">
        <button className="search-back" onClick={() => navigate("/")}>
          <X size={20} />
        </button>
        <h2 className="library-title">Your Library</h2>
      </div>

      <div className="search-tabs">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`search-tab${activeTab === key ? " active" : ""}`}
            onClick={() => setActiveTab(key)}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Liked Songs */}
          {activeTab === "liked" && (
            <div>
              {likedSongs.length === 0 ? (
                <p className="search-empty">
                  No liked songs yet. Tap the{" "}
                  <Heart size={14} style={{ display: "inline", color: "#ef4444" }} /> icon to save
                  songs.
                </p>
              ) : (
                <ul className="search-track-list">
                  {likedSongs.map((song, i) => (
                    <li
                      key={song.name}
                      className="search-track-item"
                      onClick={() => play(songs.indexOf(song))}
                    >
                      <div className="search-track-cover">
                        <Music size={20} />
                      </div>
                      <div className="search-track-info">
                        <span className="search-track-name">
                          {song.title || song.name.replace(/\.[^.]+$/, "")}
                        </span>
                        <span className="search-track-artist">{song.artist || ""}</span>
                      </div>
                      <button
                        className="list-like-btn liked"
                        style={{ opacity: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(song.name);
                        }}
                      >
                        <Heart size={14} fill="currentColor" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* History */}
          {activeTab === "history" && (
            <div>
              {history.length === 0 ? (
                <p className="search-empty">No listening history yet. Start playing some music!</p>
              ) : (
                <>
                  <div className="library-actions">
                    <button className="queue-clear" onClick={clearHistory}>
                      Clear all
                    </button>
                  </div>
                  <ul className="search-track-list">
                    {history.map((h, i) => (
                      <li
                        key={h.name + "-" + h.playedAt}
                        className="search-track-item"
                        onClick={() => {
                          const idx = songs.findIndex((s) => s.name === h.name);
                          if (idx >= 0) play(idx);
                        }}
                      >
                        <div className="search-track-cover">
                          <Clock size={16} />
                        </div>
                        <div className="search-track-info">
                          <span className="search-track-name">{h.title}</span>
                          <span className="search-track-artist">{h.artist}</span>
                        </div>
                        <span className="search-track-duration">{formatDate(h.playedAt)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {/* Playlists */}
          {activeTab === "playlists" && (
            <div>
              <div className="library-actions">
                <button className="playlist-create-btn" onClick={() => setShowCreate(true)}>
                  <Plus size={16} />
                  <span>New Playlist</span>
                </button>
              </div>

              {playlists.length === 0 ? (
                <p className="search-empty">No playlists yet. Create your first playlist!</p>
              ) : (
                <ul className="search-track-list">
                  {playlists.map((pl) => (
                    <li key={pl.id} className="search-track-item">
                      <div className="search-track-cover">
                        <ListMusic size={20} />
                      </div>
                      <div className="search-track-info">
                        <span className="search-track-name">{pl.name}</span>
                        <span className="search-track-artist">{pl.tracks.length} tracks</span>
                      </div>
                      <button
                        className="list-action-btn"
                        style={{ opacity: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlaylist(pl.id);
                        }}
                        title="Delete playlist"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Create Playlist Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Playlist</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Playlist name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
