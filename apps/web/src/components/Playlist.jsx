import { motion } from "framer-motion";
import { Play, Music, Heart } from "lucide-react";

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
};

const itemFade = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
};

export default function Playlist({ songs, currentIndex, likes, onSelect, onToggleLike }) {
  if (songs.length === 0) {
    return (
      <div className="playlist">
        <h3 className="playlist-title">Playlist</h3>
        <p className="playlist-empty">
          No songs found. Add entries to <code>songs.json</code> and music files to{" "}
          <code>public/music/</code>
        </p>
      </div>
    );
  }

  return (
    <div className="playlist">
      <h3 className="playlist-title">Playlist ({songs.length})</h3>
      <motion.ul className="song-list" {...stagger}>
        {songs.map((song, i) => {
          const isActive = i === currentIndex;
          const displayName = song.title || song.name.replace(/\.[^.]+$/, "");
          const artist = song.artist || "";
          return (
            <motion.li
              key={song.name || i}
              className={`song-item${isActive ? " active" : ""}`}
              onClick={() => onSelect(i)}
              {...itemFade}
            >
              <span className="song-index">{isActive ? <Play size={12} /> : i + 1}</span>
              <span className="song-cover-icon">
                <Music size={14} />
              </span>
              <div className="song-info">
                <span className="song-name">{displayName}</span>
                {artist && <span className="song-artist">{artist}</span>}
              </div>
              <button
                className={`list-like-btn${likes?.includes(song.name) ? " liked" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLike?.(song.name);
                }}
              >
                <Heart size={14} fill={likes?.includes(song.name) ? "currentColor" : "none"} />
              </button>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}
