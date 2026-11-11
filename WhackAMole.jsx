import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Timer } from 'lucide-react';

export default function WhackAMole({ onGameEnd }) {
  const [moles, setMoles] = useState(Array(9).fill(false));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const intervalRef = useRef(null);
  const moleTimeoutRef = useRef(null);

  const spawnMole = useCallback(() => {
    if (!gameRunning) return;
    
    const emptySpots = moles.map((m, i) => !m ? i : -1).filter(i => i !== -1);
    if (emptySpots.length === 0) return;
    
    const randomSpot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
    
    setMoles(prev => {
      const newMoles = [...prev];
      newMoles[randomSpot] = true;
      return newMoles;
    });

    moleTimeoutRef.current = setTimeout(() => {
      setMoles(prev => {
        const newMoles = [...prev];
        newMoles[randomSpot] = false;
        return newMoles;
      });
    }, 800 + Math.random() * 400);
  }, [gameRunning, moles]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setMoles(Array(9).fill(false));
    setGameRunning(true);
    setGameOver(false);
  };

  useEffect(() => {
    if (!gameRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameRunning(false);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [gameRunning]);

  useEffect(() => {
    if (!gameRunning) return;

    const spawnInterval = setInterval(spawnMole, 600);
    return () => {
      clearInterval(spawnInterval);
      if (moleTimeoutRef.current) clearTimeout(moleTimeoutRef.current);
    };
  }, [gameRunning, spawnMole]);

  useEffect(() => {
    if (gameOver) {
      onGameEnd(score * 10);
    }
  }, [gameOver, score, onGameEnd]);

  const whackMole = (index) => {
    if (!moles[index]) return;
    setMoles(prev => {
      const newMoles = [...prev];
      newMoles[index] = false;
      return newMoles;
    });
    setScore(s => s + 1);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center justify-between w-full max-w-sm">
        <div className="text-purple-300 flex items-center gap-2">
          <Timer className="w-5 h-5" />
          <span className="font-bold text-white text-xl">{timeLeft}s</span>
        </div>
        <div className="text-purple-300">
          Score: <span className="font-bold text-white text-xl">{score}</span>
        </div>
      </div>

      <div className="relative grid grid-cols-3 gap-3 p-4 bg-amber-900/30 rounded-2xl border border-amber-700/30">
        {moles.map((isUp, index) => (
          <motion.button
            key={index}
            onClick={() => whackMole(index)}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-amber-950/60 border-4 border-amber-800/50 overflow-hidden relative"
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence>
              {isUp && (
                <motion.div
                  initial={{ y: 60 }}
                  animate={{ y: 0 }}
                  exit={{ y: 60 }}
                  className="absolute inset-0 flex items-center justify-center text-4xl"
                >
                  🐹
                </motion.div>
              )}
            </AnimatePresence>
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-amber-800/50 rounded-b-full" />
          </motion.button>
        ))}

        {!gameRunning && (
          <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              {gameOver && (
                <div className="text-2xl font-bold text-white mb-4">
                  Score: {score}
                </div>
              )}
              <Button onClick={startGame} className="bg-gradient-to-r from-purple-500 to-pink-500">
                <Play className="w-4 h-4 mr-2" />
                {gameOver ? 'Opnieuw' : 'Start'}
              </Button>
            </div>
          </div>
        )}
      </div>

      <p className="text-slate-500 text-sm">Klik op de mollen zo snel mogelijk!</p>
    </div>
  );
}