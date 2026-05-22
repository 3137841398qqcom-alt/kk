import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock, Disc, Sparkles, TrendingUp, Music, Play, Search, Library } from "lucide-react";
import { useAudioContext } from "../context/AudioContext";
import { useRecommendationsQuery, useNewReleasesQuery } from "../hooks/queries";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="home-section-header">
      <Icon size={20} />
      <h3>{title}</h3>
    </div>
  );
}

function HorizontalScroll({ children }) {
  return <div className="home-scroll">{children}</div>;
}

function AlbumCard({ cover, name, subtitle, onClick }) {
  return (
    <motion.div
      className="home-card"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      <div className="home-card-cover">
        {cover ? <img src={cover} alt={name} /> : <Disc size={36} />}
        <div className="home-card-play">
          <Play size={18} fill="currentColor" />
        </div>
      </div>
      <span className="home-card-name">{name}</span>
      {subtitle && <span className="home-card-sub">{subtitle}</span>}
    </motion.div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { history, songs, play } = useAudioContext();
  const { data: recs } = useRecommendationsQuery();
  const { data: releases } = useNewReleasesQuery(12);

  const recentTracks = useMemo(() => history.slice(0, 10), [history]);
  const recommendations = recs?.recommendations?.slice(0, 10) || [];
  const trendingAlbums = releases?.albums?.slice(0, 10) || [];

  return (
    <div className="home">
      <div className="home-header">
        <h1 className="home-greeting">{getGreeting()}</h1>
      </div>

      {/* Recently Played */}
      {recentTracks.length > 0 && (
        <section className="home-section">
          <SectionHeader icon={Clock} title="Recently Played" />
          <HorizontalScroll>
            {recentTracks.map((h) => (
              <AlbumCard
                key={h.name + "-" + h.playedAt}
                name={h.title}
                subtitle={h.artist}
                onClick={() => {
                  const idx = songs.findIndex((s) => s.name === h.name);
                  if (idx >= 0) play(idx);
                }}
              />
            ))}
          </HorizontalScroll>
        </section>
      )}

      {/* Made For You */}
      {recommendations.length > 0 && (
        <section className="home-section">
          <SectionHeader icon={Sparkles} title="Made For You" />
          <HorizontalScroll>
            {recommendations.map((t) => (
              <AlbumCard
                key={t.id}
                cover={t.albumCover}
                name={t.title || t.name}
                subtitle={t.artist}
                onClick={() => {
                  const idx = songs.findIndex((s) => s.name === t.name);
                  if (idx >= 0) play(idx);
                }}
              />
            ))}
          </HorizontalScroll>
        </section>
      )}

      {/* Trending Albums */}
      {trendingAlbums.length > 0 && (
        <section className="home-section">
          <SectionHeader icon={TrendingUp} title="Trending Albums" />
          <HorizontalScroll>
            {trendingAlbums.map((a) => (
              <AlbumCard key={a.id} cover={a.cover} name={a.name} subtitle={a.artist} />
            ))}
          </HorizontalScroll>
        </section>
      )}

      {/* Quick links */}
      <section className="home-section">
        <SectionHeader icon={Music} title="Browse" />
        <div className="home-quick-grid">
          <button className="home-quick-btn" onClick={() => navigate("/search")}>
            <Search size={24} />
            <span>Search</span>
          </button>
          <button className="home-quick-btn" onClick={() => navigate("/library")}>
            <Library size={24} />
            <span>Your Library</span>
          </button>
        </div>
      </section>

      {/* Spacer for bottom player */}
      <div className="home-spacer" />
    </div>
  );
}
