import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BlindnessIndicator() {
  const [isActive, setIsActive] = useState(false);

  const check = async () => {
    try {
      const settings = await base44.entities.SiteSettings.list();
      const s = settings.find(s => s.key === 'blindness');
      if (s) {
        const data = JSON.parse(s.value);
        const active = data?.active && (!data?.expires || new Date(data.expires) > new Date());
        setIsActive(active);
      }
    } catch {}
  };

  useEffect(() => {
    check();
    const unsub = base44.entities.SiteSettings.subscribe((event) => {
      if (event.data?.key === 'blindness') {
        try {
          const data = JSON.parse(event.data.value);
          const active = data?.active && (!data?.expires || new Date(data.expires) > new Date());
          setIsActive(active);
        } catch {}
      }
    });
    return unsub;
  }, []);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-pink-600/90 backdrop-blur border border-pink-400/30 text-white px-3 py-2 rounded-full shadow-lg shadow-pink-500/30"
        >
          <EyeOff className="w-4 h-4" />
          <span className="text-xs font-bold">BLINDNESS ACTIEF</span>
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}