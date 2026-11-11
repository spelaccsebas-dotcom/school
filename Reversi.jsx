import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Play } from 'lucide-react';

export default function ReactionGame({ onGameEnd }) {
  const [gameState, setGameState] = useState('idle'); // idle, waiting, ready, result
  const [reactionTime, setReactionTime] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const startTimeRef = useRef(null);
  const timeoutRef = useRef(null);

  const startRound = useCallback(() => {
    setGameState('waiting');
    setReactionTime(null);
    
    const delay = 2000 + Math.random() * 3000; // 2-5 seconds
    timeoutRef.current = setTimeout(() => {
      startTimeRef.current = Date.now();
      setGameState('ready');
    }, delay);
  }, []);

  const handleClick = () => {
    if (gameState === 'waiting') {
      // Too early!
      clearTimeout(timeoutRef.current);
      setReactionTime(-1);
      setGameState('result');
    } else if (gameState === 'ready') {
      const time = Date.now() - startTimeRef.current;
      setReactionTime(time);
      setAttempts(prev => [...prev, time]);
      setGameState('result');
      
      if (attempts.length >= 4) {
        const allTimes = [...attempts, time];
        const avgTime = allTimes.reduce((a, b) => a + b, 0) / allTimes.length;
        const score = Math.max(1000 - Math.round(avgTime), 100);
        onGameEnd(score);
      }
    } else if (gameState === 'result' || gameState === 'idle') {
      startRound();
    }
  };

  const getAverage = () => {
    if (attempts.length === 0) return 0;
    return Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-6 text-sm">
        <div className="text-purple-300">
          Poging: <span className="font-bold text-white">{attempts.length + 1}/5</span>
        </div>
        <div className="text-purple-300">
          Gemiddelde: <span className="font-bold text-white">{getAverage()}ms</span>
        </div>
      </div>

      <motion.button
        onClick={handleClick}
        className={`w-64 h-64 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all ${
          gameState === 'idle' ? 'bg-slate-800 border-2 border-purple-500/30' :
          gameState === 'waiting' ? 'bg-red-600 cursor-wait' :
          gameState === 'ready' ? 'bg-green-500 cursor-pointer' :
          reactionTime === -1 ? 'bg-red-800' : 'bg-blue-600'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {gameState === 'idle' && (
          <>
            <Play className="w-12 h-12 text-purple-400" />
            <span className="text-xl font-bold text-white">Klik om te starten</span>
          </>
        )}
        {gameState === 'waiting' && (
          <>
            <Zap className="w-12 h-12 text-white animate-pulse" />
            <span className="text-xl font-bold text-white">Wacht...</span>
          </>
        )}
        {gameState === 'ready' && (
          <>
            <Zap className="w-16 h-16 text-white" />
            <span className="text-2xl font-bold text-white">KLIK NU!</span>
          </>
        )}
        {gameState === 'result' && (
          <>
            <span className="text-4xl font-bold text-white">
              {reactionTime === -1 ? 'Te vroeg!' : `${reactionTime}ms`}
            </span>
            <span className="text-lg text-white/80">
              {reactionTime === -1 ? 'Probeer opnieuw' : 'Klik voor volgende'}
            </span>
          </>
        )}
      </motion.button>

      {attempts.length > 0 && (
        <div className="flex gap-2">
          {attempts.map((time, i) => (
            <div key={i} className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm">
              {time}ms
            </div>
          ))}
        </div>
      )}
    </div>
  );
}