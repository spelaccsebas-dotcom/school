import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';

const COLORS = [
  { id: 0, color: 'bg-red-500', active: 'bg-red-300', name: 'red' },
  { id: 1, color: 'bg-blue-500', active: 'bg-blue-300', name: 'blue' },
  { id: 2, color: 'bg-green-500', active: 'bg-green-300', name: 'green' },
  { id: 3, color: 'bg-yellow-500', active: 'bg-yellow-300', name: 'yellow' },
];

export default function SimonSays({ onGameEnd }) {
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [activeColor, setActiveColor] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const playSequence = useCallback(async (seq) => {
    setIsPlayerTurn(false);
    for (let i = 0; i < seq.length; i++) {
      await new Promise(r => setTimeout(r, 400));
      setActiveColor(seq[i]);
      await new Promise(r => setTimeout(r, 400));
      setActiveColor(null);
    }
    setIsPlayerTurn(true);
  }, []);

  const addToSequence = useCallback(() => {
    const newColor = Math.floor(Math.random() * 4);
    const newSequence = [...sequence, newColor];
    setSequence(newSequence);
    setPlayerSequence([]);
    playSequence(newSequence);
  }, [sequence, playSequence]);

  const startGame = () => {
    setSequence([]);
    setPlayerSequence([]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    setTimeout(() => {
      const firstColor = Math.floor(Math.random() * 4);
      setSequence([firstColor]);
      playSequence([firstColor]);
    }, 500);
  };

  const handleColorClick = (colorId) => {
    if (!isPlayerTurn || gameOver) return;

    setActiveColor(colorId);
    setTimeout(() => setActiveColor(null), 200);

    const newPlayerSequence = [...playerSequence, colorId];
    setPlayerSequence(newPlayerSequence);

    const currentIndex = newPlayerSequence.length - 1;
    if (sequence[currentIndex] !== colorId) {
      // Wrong!
      setGameOver(true);
      setIsPlaying(false);
      onGameEnd(score * 50);
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      // Correct sequence!
      setScore(s => s + 1);
      setTimeout(addToSequence, 800);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center justify-between w-full max-w-xs">
        <div className="text-purple-300">
          Niveau: <span className="font-bold text-white">{score}</span>
        </div>
        <Button onClick={startGame} variant="outline" size="sm" className="border-purple-500/30 hover:bg-purple-500/20">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="relative">
        <div className="grid grid-cols-2 gap-3">
          {COLORS.map((c) => (
            <motion.button
              key={c.id}
              onClick={() => handleColorClick(c.id)}
              disabled={!isPlayerTurn || gameOver}
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl transition-all ${
                activeColor === c.id ? c.active : c.color
              } ${!isPlayerTurn ? 'opacity-70' : 'hover:opacity-90'}`}
              whileTap={{ scale: 0.95 }}
              style={{
                boxShadow: activeColor === c.id ? `0 0 30px ${c.name}` : 'none'
              }}
            />
          ))}
        </div>

        {!isPlaying && (
          <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              {gameOver && (
                <div className="text-2xl font-bold text-white mb-4">
                  Niveau {score} bereikt!
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

      <div className="text-slate-400 text-sm text-center">
        {isPlayerTurn ? 'Jouw beurt! Herhaal de reeks.' : 'Kijk goed...'}
      </div>
    </div>
  );
}