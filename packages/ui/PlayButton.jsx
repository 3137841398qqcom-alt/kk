import { Play, Pause, Loader2 } from "lucide-react";

export default function PlayButton({ isPlaying, loading, onClick }) {
  const icon = loading ? <Loader2 className="animate-spin" /> : isPlaying ? <Pause /> : <Play />;

  return (
    <button className="ctrl-btn play-btn" onClick={onClick} disabled={loading}>
      {icon}
    </button>
  );
}
