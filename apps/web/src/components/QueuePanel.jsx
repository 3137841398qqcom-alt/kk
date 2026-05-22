import { motion, AnimatePresence } from "framer-motion";
import { X, Music } from "lucide-react";
import { useAudioContext } from "../context/AudioContext";

export default function QueuePanel() {
  const { queue, songs, removeFromQueue, clearQueue } = useAudioContext();

  if (queue.length === 0) return null;

  return (
    <div className="queue-panel">
      <div className="queue-header">
        <h3 className="queue-title">Queue ({queue.length})</h3>
        <button className="queue-clear" onClick={clearQueue}>
          Clear
        </button>
      </div>
      <ul className="queue-list">
        <AnimatePresence>
          {queue.map((songIndex, qi) => {
            const song = songs[songIndex];
            if (!song) return null;
            const displayName = song.title || song.name?.replace(/\.[^.]+$/, "");
            return (
              <motion.li
                key={`${songIndex}-${qi}`}
                className="queue-item"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                layout
              >
                <Music size={14} className="queue-item-icon" />
                <span className="queue-item-name">{displayName}</span>
                <button
                  className="queue-remove"
                  onClick={() => removeFromQueue(qi)}
                  title="Remove from queue"
                >
                  <X size={14} />
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
