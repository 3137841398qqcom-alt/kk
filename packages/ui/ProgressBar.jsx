import { useRef } from "react";
import { formatTime } from "@music-player/shared";

export default function ProgressBar({ currentTime, duration, onSeek }) {
  const barRef = useRef(null);
  const progress = duration ? (currentTime / duration) * 100 : 0;

  const handleClick = (e) => {
    if (!barRef.current || !duration) return;
    const rect = barRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(ratio * duration);
  };

  return (
    <div className="progress-container" ref={barRef} onClick={handleClick}>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
        <div className="progress-thumb" style={{ left: `${progress}%` }} />
      </div>
      <div className="time-display">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
