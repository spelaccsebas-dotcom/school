import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Upload, X, Trash2, Play } from 'lucide-react';

export default function Videos() {
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: videos = [], isLoading } = useQuery({
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
        title,
        description,
        video_url: file_url,
        uploader_name: user.full_name || user.email,
        uploader_email: user.email,
      });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setTitle('');
      setDescription('');
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white text-xl">Laden...</div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pb-32">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
            <Video className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm">Video's</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Video Gallery
          </h1>
          <p className="text-slate-400 mt-2">Upload en bekijk video's van iedereen</p>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/60 border border-blue-500/20 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-400" />
            Video Uploaden
          </h2>
          <div className="space-y-3">
            <Input
              placeholder="Titel van de video *"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
            <Input
              placeholder="Beschrijving (optioneel)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
            <div
              className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500/50 transition-colors relative"
              onClick={() => document.getElementById('video-upload').click()}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <Video className="w-6 h-6 text-blue-400" />
                  <span className="text-white font-medium">{selectedFile.name}</span>
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedFile(null); }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Video className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400">Klik om een video te kiezen</p>
                  <p className="text-slate-600 text-sm mt-1">MP4, MOV, WebM ondersteund</p>
                </>
              )}
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                className="hidden"
                onChange={e => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>
            <Button
              onClick={handleUpload}
              disabled={!title || !selectedFile || uploading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploaden...
                </div>
              ) : (
                <><Upload className="w-4 h-4 mr-2" />Video Uploaden</>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Videos Grid */}
        <h2 className="text-white font-bold text-xl mb-4">Alle Video's ({videos.length})</h2>
        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Laden...</div>
        ) : videos.length === 0 ? (
          <div className="text-center py-16">
            <Video className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Nog geen video's. Upload de eerste!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-slate-900/60 border border-slate-700 rounded-xl overflow-hidden hover:border-blue-500/40 transition-all group"
              >
                <div
                  className="relative aspect-video bg-slate-800 cursor-pointer"
                  onClick={() => setPlayingVideo(video)}
                >
                  <video
                    src={video.video_url}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
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
                      <button
                        onClick={() => deleteMutation.mutate(video.id)}
                        className="text-red-400 hover:text-red-300 p-1 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {playingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setPlayingVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-3xl bg-slate-900 rounded-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div>
                  <h3 className="text-white font-bold">{playingVideo.title}</h3>
                  <p className="text-slate-400 text-sm">door {playingVideo.uploader_name}</p>
                </div>
                <button onClick={() => setPlayingVideo(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <video
                src={playingVideo.video_url}
                controls
                autoPlay
                className="w-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}