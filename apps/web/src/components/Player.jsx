import { useRef, useEffect } from "react";
import { PlayButton, ProgressBar } from "@music-player/ui";
import { SkipBack, SkipForward, Music, Disc, Volume2, Volume1, VolumeX, Heart } from "lucide-react";

export default function Player({
  currentSong,
  metadata,
  isPlaying,
  currentTime,
  duration,
  volume,
  loading,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  isLiked,
  onToggleLike,
}) {
  const volumeRef = useRef(null);

  const handleVolumeClick = (e) => {
    if (!volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onVolumeChange(Math.max(0, Math.min(1, ratio)));
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        onTogglePlay();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onTogglePlay]);

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const title = metadata?.title || currentSong?.name || "No Track Selected";
  const artist = metadata?.artist || "Unknown Artist";
  const album = metadata?.album || "Unknown Album";

  return (
    <div className="player">
      <div className="player-cover">
        <div className="cover-placeholder">
          {currentSong ? <Music size={48} /> : <Disc size={48} />}
        </div>
      </div>

      <div className="player-info">
        <div className="track-header">
          <h2 className="track-title">{title}</h2>
          {currentSong && (
            <button
              className={`like-btn${isLiked?.(currentSong.name) ? " liked" : ""}`}
              onClick={() => onToggleLike?.(currentSong.name)}
              title="Like"
            >
              <Heart size={20} fill={isLiked?.(currentSong.name) ? "currentColor" : "none"} />
            </button>
          )}
        </div>
        <p className="track-artist">{artist}</p>
        <p className="track-album">{album}</p>
      </div>

      <ProgressBar currentTime={currentTime} duration={duration} onSeek={onSeek} />

      <div className="controls">
        <button className="ctrl-btn" onClick={onPrev} title="Previous">
          <SkipBack />
        </button>
        <PlayButton isPlaying={isPlaying} loading={loading} onClick={onTogglePlay} />
        <button className="ctrl-btn" onClick={onNext} title="Next">
          <SkipForward />
        </button>
      </div>

      <div className="volume-control">
        <VolumeIcon size={18} className="volume-icon" />
        <div className="volume-bar" ref={volumeRef} onClick={handleVolumeClick}>
          <div className="volume-fill" style={{ width: `${volume * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
