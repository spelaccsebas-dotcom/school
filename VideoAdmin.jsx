import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Trash2, Play, X, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { timeAgo } from '@/lib/time';

export default function VideoAdmin() {
  const [playingVideo, setPlayingVideo] = useState(null);
  const queryClient = useQueryClient();

  const { data: videos = [] } = useQuery({
    queryKey: ['admin-videos'],
    queryFn: () => base44.entities.Video.list('-created_date', 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Video.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success('Video verwijderd');
    },
  });

  return (
    <div>
      <div className="bg-slate-900/50 border border-blue-500/20 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-blue-500/20">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-400" />
            Alle Video's ({videos.length})
          </h2>
        </div>
        <div className="max-h-[600px] overflow-y-auto">
          {videos.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Nog geen video's geüpload</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {videos.map(video => (
                <div key={video.id} className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden group">
                  <div
                    className="relative aspect-video bg-slate-900 cursor-pointer"
                    onClick={() => setPlayingVideo(video)}
                  >
                    <video src={video.video_url} className="w-full h-full object-cover" preload="metadata" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="p-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-white font-semibold text-sm truncate">{video.title}</div>
                      <div className="text-slate-400 text-xs">{video.uploader_name}</div>
                      <div className="text-slate-500 text-xs">{timeAgo(video.created_date)}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(video.id)}
                      className="text-red-400 hover:bg-red-500/10 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Player modal */}
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
              <video src={playingVideo.video_url} controls autoPlay className="w-full" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}