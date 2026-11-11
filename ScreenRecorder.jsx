import React, { useState, useRef } from 'react';
import useDraggable from '../hooks/useDraggable';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { MonitorPlay, Square, Upload, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from '@tanstack/react-query';

export default function ScreenRecorder() {
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState(null);
  const [showSave, setShowSave] = useState(false);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const queryClient = useQueryClient();
  const drag = useDraggable('recorder-btn-pos', { x: window.innerWidth - 80, y: window.innerHeight - 140 });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const b = new Blob(chunksRef.current, { type: 'video/webm' });
        setBlob(b);
        setShowSave(true);
        setRecording(false);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch (e) {
      // user cancelled or denied
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const saveRecording = async () => {
    if (!blob || !title) return;
    setUploading(true);
    try {
      const file = new File([blob], `${title}.webm`, { type: 'video/webm' });
      const user = await base44.auth.me();
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.Video.create({
        title,
        video_url: file_url,
        uploader_name: user.full_name || user.email,
        uploader_email: user.email,
        description: 'Schermopname',
      });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setBlob(null);
      setShowSave(false);
      setTitle('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <div ref={drag.containerRef} style={drag.containerStyle}>
        <div
          onMouseDown={drag.onDragStart}
          onTouchStart={drag.onDragStart}
          className="absolute -top-2 -left-2 -right-2 -bottom-2 cursor-grab active:cursor-grabbing rounded-full"
          style={{ zIndex: -1 }}
        />
        {recording ? (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={stopRecording}
            className="flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg font-medium text-sm"
          >
            <div className="w-3 h-3 bg-white rounded-sm" />
            Stop
          </motion.button>
        ) : (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={startRecording}
            className="w-12 h-12 flex items-center justify-center bg-slate-800/90 hover:bg-slate-700 text-white rounded-full shadow-lg border border-slate-600 backdrop-blur"
            title="Scherm opnemen"
          >
            <MonitorPlay className="w-5 h-5 text-purple-400" />
          </motion.button>
        )}
      </div>

      {/* Save modal */}
      <AnimatePresence>
        {showSave && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-purple-500/20 rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">Opname Opslaan</h3>
                <button onClick={() => { setShowSave(false); setBlob(null); }} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {blob && (
                <video
                  src={URL.createObjectURL(blob)}
                  controls
                  className="w-full rounded-lg mb-4 max-h-40 object-cover"
                />
              )}
              <Input
                placeholder="Geef de opname een naam *"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white mb-3"
              />
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => { setShowSave(false); setBlob(null); }}
                  className="flex-1 text-slate-400"
                >
                  Weggooien
                </Button>
                <Button
                  onClick={saveRecording}
                  disabled={!title || uploading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Upload className="w-4 h-4 mr-1" />Opslaan</>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}