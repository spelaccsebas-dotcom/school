import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, Plus, Trash2, ListMusic, Music2, ChevronRight, X, Video, Upload } from 'lucide-react';

const TRACKS = [
  { id: '1', title: 'Song 1', artist: 'SoundHelix', genre: 'Electronic', duration: '~4 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', emoji: '🎵' },
  { id: '2', title: 'Song 2', artist: 'SoundHelix', genre: 'Electronic', duration: '~4 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', emoji: '🎸' },
  { id: '3', title: 'Song 3', artist: 'SoundHelix', genre: 'Chill', duration: '~4 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', emoji: '🎹' },
  { id: '4', title: 'Song 4', artist: 'SoundHelix', genre: 'Upbeat', duration: '~4 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', emoji: '☀️' },
  { id: '5', title: 'Song 5', artist: 'SoundHelix', genre: 'Happy', duration: '~4 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', emoji: '🎺' },
  { id: '6', title: 'Song 6', artist: 'SoundHelix', genre: 'Chill', duration: '~4 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', emoji: '💜' },
  { id: '7', title: 'Song 7', artist: 'SoundHelix', genre: 'Upbeat', duration: '~4 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', emoji: '🎶' },
  { id: '8', title: 'Song 8', artist: 'SoundHelix', genre: 'Funky', duration: '~4 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', emoji: '🕺' },
  { id: '9', title: 'Song 9', artist: 'SoundHelix', genre: 'Rock', duration: '~4 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', emoji: '🎸' },
  { id: '10', title: 'Song 10', artist: 'SoundHelix', genre: 'Electronic', duration: '~4 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', emoji: '🦌' },
  { id: '11', title: 'Song 11', artist: 'SoundHelix', genre: 'Energiek', duration: '~4 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', emoji: '⚡' },
  { id: '12', title: 'Song 12', artist: 'SoundHelix', genre: 'Chill', duration: '~4 min', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', emoji: '💡' },
];

export default function Music() {
  const [user, setUser] = useState(null);
  const [mainTab, setMainTab] = useState('muziek'); // 'muziek' | 'videos'
  const queryClient = useQueryClient();

  // Music state
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeView, setActiveView] = useState('library');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(null);

  // Video state
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  useEffect(() => {
    const handler = (e) => {
      setCurrentTrackId(e.detail.currentTrack?.id || null);
      setIsPlaying(e.detail.isPlaying);
    };
    window.addEventListener('music:state', handler);
    return () => window.removeEventListener('music:state', handler);
  }, []);

  // Music queries
  const { data: playlists = [], refetch } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => base44.entities.Playlist.list('-created_date'),
    enabled: !!user,
  });

  const createPlaylistMutation = useMutation({
    mutationFn: (name) => base44.entities.Playlist.create({ name, track_ids: [] }),
    onSuccess: () => { refetch(); setNewPlaylistName(''); },
  });
  const deletePlaylistMutation = useMutation({
    mutationFn: (id) => base44.entities.Playlist.delete(id),
    onSuccess: () => { refetch(); setActiveView('playlists'); },
  });
  const addToPlaylistMutation = useMutation({
    mutationFn: ({ playlist, trackId }) => {
      const updated = [...new Set([...(playlist.track_ids || []), trackId])];
      return base44.entities.Playlist.update(playlist.id, { track_ids: updated });
    },
    onSuccess: () => { refetch(); setShowAddToPlaylist(null); },
  });
  const removeFromPlaylistMutation = useMutation({
    mutationFn: ({ playlist, trackId }) => {
      const updated = (playlist.track_ids || []).filter(id => id !== trackId);
      return base44.entities.Playlist.update(playlist.id, { track_ids: updated });
    },
    onSuccess: () => refetch(),
  });

  // Video queries
  const { data: videos = [], isLoading: videosLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: () => base44.entities.Video.list('-created_date', 50),
    enabled: !!user,
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Video.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['videos'] }),
  });

  const handleUpload = async () => {
    if (!selectedFile || !title) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });
      await base44.entities.Video.create({
        title, description,
        video_url: file_url,
        uploader_name: user.full_name || user.email,
        uploader_email: user.email,
      });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setTitle(''); setDescription(''); setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const getActiveTrackList = () => {
    if (activeView === 'library') return TRACKS;
    const pl = playlists.find(p => p.id === activeView);
    if (!pl) return TRACKS;
    return (pl.track_ids || []).map(id => TRACKS.find(t => t.id === id)).filter(Boolean);
  };
  const playTrack = (track) => {
    const tracks = getActiveTrackList();
    window.dispatchEvent(new CustomEvent('music:play', { detail: { track, tracks } }));
  };
  const currentPlaylist = playlists.find(p => p.id === activeView);
  const displayTracks = activeView === 'library' ? TRACKS : activeView === 'playlists' ? [] : getActiveTrackList();

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white text-xl">Laden...</div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 pb-32">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-6">
            Media
          </h1>
          {/* Main tabs */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setMainTab('muziek')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${mainTab === 'muziek' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
            >
              <Music2 className="w-4 h-4" /> Muziek
            </button>
            <button
              onClick={() => setMainTab('videos')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${mainTab === 'videos' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
            >
              <Video className="w-4 h-4" /> Video's
            </button>
          </div>
        </motion.div>

        {/* MUZIEK TAB */}
        {mainTab === 'muziek' && (
          <div className="flex gap-4">
            {/* Sidebar */}
            <div className="w-48 shrink-0 space-y-1">
              <button
                onClick={() => setActiveView('library')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${activeView === 'library' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Music2 className="w-4 h-4" /> Bibliotheek
              </button>
              <button
                onClick={() => setActiveView('playlists')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${activeView === 'playlists' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <ListMusic className="w-4 h-4" /> Afspeellijsten
              </button>
              {playlists.length > 0 && (
                <div className="pt-2 border-t border-slate-700/50 mt-2">
                  {playlists.map(pl => (
                    <button
                      key={pl.id}
                      onClick={() => setActiveView(pl.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-all ${activeView === pl.id ? 'bg-purple-500/20 text-purple-300' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                      <ChevronRight className="w-3 h-3 shrink-0" />
                      <span className="truncate">{pl.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Main music content */}
            <div className="flex-1 min-w-0">
              {activeView === 'playlists' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-white font-bold text-lg mb-4">Mijn Afspeellijsten</h2>
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Nieuwe afspeellijst..."
                      value={newPlaylistName}
                      onChange={e => setNewPlaylistName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && newPlaylistName && createPlaylistMutation.mutate(newPlaylistName)}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                    <Button onClick={() => newPlaylistName && createPlaylistMutation.mutate(newPlaylistName)} className="bg-purple-600 hover:bg-purple-700 shrink-0">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {playlists.map(pl => (
                      <div key={pl.id} className="bg-slate-900/60 border border-purple-500/20 rounded-xl p-4 cursor-pointer hover:border-purple-500/50 transition-all group relative" onClick={() => setActiveView(pl.id)}>
                        <div className="text-3xl mb-2">🎵</div>
                        <div className="text-white font-semibold text-sm">{pl.name}</div>
                        <div className="text-slate-500 text-xs">{(pl.track_ids || []).length} nummers</div>
                        <button onClick={e => { e.stopPropagation(); deletePlaylistMutation.mutate(pl.id); }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {playlists.length === 0 && <div className="col-span-2 text-center py-12 text-slate-500">Nog geen afspeellijsten. Maak er een aan!</div>}
                  </div>
                </motion.div>
              )}

              {activeView !== 'playlists' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-bold text-lg">{activeView === 'library' ? 'Alle Nummers' : currentPlaylist?.name || 'Afspeellijst'}</h2>
                    <span className="text-slate-500 text-sm">{displayTracks.length} nummers</span>
                  </div>
                  <div className="space-y-1">
                    {displayTracks.map((track, i) => {
                      const active = currentTrackId === track.id;
                      return (
                        <div key={track.id} className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer group ${active ? 'bg-purple-500/20 border border-purple-500/30' : 'hover:bg-slate-800/60 border border-transparent'}`} onClick={() => playTrack(track)}>
                          <div className="w-8 text-center text-slate-500 text-sm group-hover:hidden">{active && isPlaying ? '▶' : i + 1}</div>
                          <div className="w-8 text-center hidden group-hover:block">
                            {active && isPlaying ? <Pause className="w-4 h-4 text-purple-400 mx-auto" /> : <Play className="w-4 h-4 text-purple-400 mx-auto" />}
                          </div>
                          <span className="text-xl">{track.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium text-sm truncate ${active ? 'text-purple-300' : 'text-white'}`}>{track.title}</div>
                            <div className="text-slate-500 text-xs">{track.artist} · {track.genre}</div>
                          </div>
                          <span className="text-slate-500 text-xs">{track.duration}</span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={e => { e.stopPropagation(); setShowAddToPlaylist(track.id); }} className="p-1.5 rounded-lg hover:bg-purple-500/20 text-slate-400 hover:text-purple-300" title="Toevoegen aan afspeellijst">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            {activeView !== 'library' && currentPlaylist && (
                              <button onClick={e => { e.stopPropagation(); removeFromPlaylistMutation.mutate({ playlist: currentPlaylist, trackId: track.id }); }} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-300">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {displayTracks.length === 0 && <div className="text-center py-12 text-slate-500">Geen nummers. Voeg nummers toe via de bibliotheek!</div>}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* VIDEOS TAB */}
        {mainTab === 'videos' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Upload */}
            <div className="bg-slate-900/60 border border-blue-500/20 rounded-2xl p-6 mb-8">
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                Video Uploaden
              </h2>
              <div className="space-y-3">
                <Input placeholder="Titel van de video *" value={title} onChange={e => setTitle(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                <Input placeholder="Beschrijving (optioneel)" value={description} onChange={e => setDescription(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500/50 transition-colors relative" onClick={() => document.getElementById('video-upload').click()}>
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <Video className="w-6 h-6 text-blue-400" />
                      <span className="text-white font-medium">{selectedFile.name}</span>
                      <button onClick={e => { e.stopPropagation(); setSelectedFile(null); }} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <>
                      <Video className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-400">Klik om een video te kiezen</p>
                      <p className="text-slate-600 text-sm mt-1">MP4, MOV, WebM ondersteund</p>
                    </>
                  )}
                  <input id="video-upload" type="file" accept="video/*" className="hidden" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                </div>
                <Button onClick={handleUpload} disabled={!title || !selectedFile || uploading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90">
                  {uploading ? <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Uploaden...</div> : <><Upload className="w-4 h-4 mr-2" />Video Uploaden</>}
                </Button>
              </div>
            </div>

            {/* Videos Grid */}
            <h2 className="text-white font-bold text-xl mb-4">Alle Video's ({videos.length})</h2>
            {videosLoading ? (
              <div className="text-center py-12 text-slate-400">Laden...</div>
            ) : videos.length === 0 ? (
              <div className="text-center py-16">
                <Video className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Nog geen video's. Upload de eerste!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((video, i) => (
                  <motion.div key={video.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="bg-slate-900/60 border border-slate-700 rounded-xl overflow-hidden hover:border-blue-500/40 transition-all group">
                    <div className="relative aspect-video bg-slate-800 cursor-pointer" onClick={() => setPlayingVideo(video)}>
                      <video src={video.video_url} className="w-full h-full object-cover" preload="metadata" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-white font-semibold text-sm truncate">{video.title}</h3>
                          {video.description && <p className="text-slate-500 text-xs truncate mt-0.5">{video.description}</p>}
                          <p className="text-slate-500 text-xs mt-1">door {video.uploader_name}</p>
                        </div>
                        {video.uploader_email === user.email && (
                          <button onClick={() => deleteMutation.mutate(video.id)} className="text-red-400 hover:text-red-300 p-1 shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Add to playlist popup */}
      <AnimatePresence>
        {showAddToPlaylist && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddToPlaylist(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-900 border border-purple-500/20 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
              <h3 className="text-white font-bold mb-4">Toevoegen aan afspeellijst</h3>
              {playlists.length === 0 ? (
                <p className="text-slate-400 text-sm">Geen afspeellijsten. Maak er eerst een aan.</p>
              ) : (
                <div className="space-y-2">
                  {playlists.map(pl => (
                    <button key={pl.id} onClick={() => addToPlaylistMutation.mutate({ playlist: pl, trackId: showAddToPlaylist })} className="w-full text-left px-4 py-3 rounded-xl bg-slate-800 hover:bg-purple-500/20 text-white text-sm transition-all flex items-center justify-between">
                      <span>{pl.name}</span>
                      <span className="text-slate-500 text-xs">{(pl.track_ids || []).length} nrs</span>
                    </button>
                  ))}
                </div>
              )}
              <Button variant="ghost" onClick={() => setShowAddToPlaylist(null)} className="w-full mt-3 text-slate-400">Annuleren</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Player Modal */}
      <AnimatePresence>
        {playingVideo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setPlayingVideo(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="w-full max-w-3xl bg-slate-900 rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div>
                  <h3 className="text-white font-bold">{playingVideo.title}</h3>
                  <p className="text-slate-400 text-sm">door {playingVideo.uploader_name}</p>
                </div>
                <button onClick={() => setPlayingVideo(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <video src={playingVideo.video_url} controls autoPlay className="w-full" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}