import { useState, useRef, useEffect } from "react";
import { PlayButton, ProgressBar } from "@music-player/ui";
import {
  SkipBack,
  SkipForward,
  Music,
  Disc,
  Volume2,
  Volume1,
  VolumeX,
  Heart,
  ListMusic,
} from "lucide-react";
import { useAudioContext } from "../context/AudioContext";

export default function Player() {
  const {
    currentSong,
    metadata,
    isPlaying,
    currentTime,
    duration,
    volume,
    loading,
    togglePlay,
    playNext,
    playPrev,
    seek,
    setVolume,
    isLiked,
    toggleLike,
  } = useAudioContext();

  const [showVolume, setShowVolume] = useState(false);
  const volumeRef = useRef(null);
  const volumeTimeout = useRef(null);

  const handleVolumeClick = (e) => {
    if (!volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setVolume(Math.max(0, Math.min(1, ratio)));
  };

  const handleVolumeEnter = () => {
    if (volumeTimeout.current) clearTimeout(volumeTimeout.current);
    setShowVolume(true);
  };
  const handleVolumeLeave = () => {
    volumeTimeout.current = setTimeout(() => setShowVolume(false), 600);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [togglePlay]);

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const title = metadata?.title || currentSong?.name || "No Track Selected";
  const artist = metadata?.artist || "";

  return (
    <div className="bottom-player">
      <div className="bottom-progress">
        <ProgressBar variant="thin" currentTime={currentTime} duration={duration} onSeek={seek} />
      </div>

      <div className="bottom-player-inner">
        <div className="bottom-player-left">
          <div className="bottom-cover">
            <div className="bottom-cover-placeholder">
              {currentSong ? <Music size={24} /> : <Disc size={24} />}
            </div>
          </div>
          <div className="bottom-track-info">
            <span className="bottom-track-title">{title}</span>
            {artist && <span className="bottom-track-artist">{artist}</span>}
          </div>
          {currentSong && (
            <button
              className={`bottom-like-btn${isLiked?.(currentSong.name) ? " liked" : ""}`}
              onClick={() => toggleLike?.(currentSong.name)}
              title="Like"
            >
              <Heart size={16} fill={isLiked?.(currentSong.name) ? "currentColor" : "none"} />
            </button>
          )}
        </div>

        <div className="bottom-player-center">
          <button className="bottom-ctrl-btn" onClick={playPrev} title="Previous">
            <SkipBack size={18} />
          </button>
          <PlayButton isPlaying={isPlaying} loading={loading} onClick={togglePlay} />
          <button className="bottom-ctrl-btn" onClick={playNext} title="Next">
            <SkipForward size={18} />
          </button>
        </div>

        <div className="bottom-player-right">
          <div
            className="bottom-volume-wrap"
            onMouseEnter={handleVolumeEnter}
            onMouseLeave={handleVolumeLeave}
          >
            <button className="bottom-ctrl-btn volume-btn" title="Volume">
              <VolumeIcon size={18} />
            </button>
            {showVolume && (
              <div className="volume-popup">
                <div className="volume-bar" ref={volumeRef} onClick={handleVolumeClick}>
                  <div className="volume-fill" style={{ width: `${volume * 100}%` }} />
                </div>
              </div>
            )}
          </div>
          <button className="bottom-ctrl-btn" title="Queue">
            <ListMusic size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
