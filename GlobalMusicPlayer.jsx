import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

export default function GlobalMusicPlayer() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const handlePlay = (e) => {
      const { track, tracks } = e.detail;
      setPlaylist(tracks || []);
      if (currentTrack?.id === track.id) {
        setIsPlaying(prev => !prev);
      } else {
        setCurrentTrack(track);
        setIsPlaying(true);
        setProgress(0);
      }
    };

    const handleStop = () => {
      setIsPlaying(false);
    };

    window.addEventListener('music:play', handlePlay);
    window.addEventListener('music:stop', handleStop);
    return () => {
      window.removeEventListener('music:play', handlePlay);
      window.removeEventListener('music:stop', handleStop);
    };
  }, [currentTrack]);

  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    audioRef.current.src = currentTrack.url;
    if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
    else audioRef.current.pause();
  }, [currentTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
    else audioRef.current.pause();
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  // Notify music page of current state
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('music:state', { detail: { currentTrack, isPlaying } }));
  }, [currentTrack, isPlaying]);

  const skipTo = (dir) => {
    if (!playlist.length || !currentTrack) return;
    const idx = playlist.findIndex(t => t.id === currentTrack.id);
    const next = (idx + dir + playlist.length) % playlist.length;
    setCurrentTrack(playlist[next]);
    setIsPlaying(true);
  };

  if (!currentTrack) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-purple-500/20 px-4 py-3 z-50"
    >
      <audio
        ref={audioRef}
        onTimeUpdate={e => { setProgress(e.target.currentTime); setDuration(e.target.duration || 0); }}
        onEnded={() => skipTo(1)}
      />
      {/* Progress bar */}
      <div
        className="w-full h-1 bg-slate-700 rounded-full mb-3 cursor-pointer"
        onClick={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          if (audioRef.current) audioRef.current.currentTime = pct * duration;
        }}
      >
        <div
          className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
          style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }}
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Track info */}
        <div className="flex items-center gap-3 w-48 min-w-0">
          <span className="text-2xl">{currentTrack.emoji}</span>
          <div className="min-w-0">
            <div className="text-white text-sm font-semibold truncate">{currentTrack.title}</div>
            <div className="text-slate-400 text-xs">{currentTrack.artist}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 flex items-center justify-center gap-4">
          <button onClick={() => skipTo(-1)} className="text-slate-400 hover:text-white transition-colors">
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
          </button>
          <button onClick={() => skipTo(1)} className="text-slate-400 hover:text-white transition-colors">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 w-32">
          <button onClick={() => setMuted(!muted)} className="text-slate-400 hover:text-white transition-colors">
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range" min="0" max="1" step="0.05"
            value={muted ? 0 : volume}
            onChange={e => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
            className="w-full accent-purple-500"
          />
        </div>
      </div>
    </motion.div>
  );
}