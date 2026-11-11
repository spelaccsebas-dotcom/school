import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { Play, Timer, Trophy } from 'lucide-react';

const COLORS = [
  { name: 'ROOD', color: 'text-red-500' },
  { name: 'BLAUW', color: 'text-blue-500' },
  { name: 'GROEN', color: 'text-green-500' },
  { name: 'GEEL', color: 'text-yellow-500' },
  { name: 'PAARS', color: 'text-purple-500' },
  { name: 'ORANJE', color: 'text-orange-500' },
];

export default function ColorMatch({ onGameEnd }) {
  const [currentWord, setCurrentWord] = useState(null);
  const [currentColor, setCurrentColor] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const generateNew = useCallback(() => {
    const wordIndex = Math.floor(Math.random() * COLORS.length);
    const colorIndex = Math.floor(Math.random() * COLORS.length);
    setCurrentWord(COLORS[wordIndex]);
    setCurrentColor(COLORS[colorIndex]);
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameRunning(true);
    setGameOver(false);
    generateNew();
  };

  useEffect(() => {
    if (!gameRunning) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameRunning(false);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameRunning]);

  useEffect(() => {
    if (gameOver) {
      onGameEnd(score * 20);
    }
  }, [gameOver, score, onGameEnd]);

  const handleAnswer = (isMatch) => {
    const actualMatch = currentWord.name === currentColor.name.toUpperCase() || 
                        COLORS.find(c => c.color === currentColor.color)?.name === currentWord.name;
    
    if (isMatch === actualMatch) {
      setScore(s => s + 1);
    } else {
      setScore(s => Math.max(0, s - 1));
    }
    generateNew();
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

      <div className="relative bg-slate-800/50 rounded-2xl p-8 border border-purple-500/20 min-w-[300px]">
        {gameRunning ? (
          <motion.div
            key={`${currentWord?.name}-${currentColor?.color}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className={`text-5xl font-bold mb-4 ${currentColor?.color}`}>
              {currentWord?.name}
            </div>
            <div className="text-slate-400 text-sm">
              Komt de tekstkleur overeen met het woord?
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-8">
            {gameOver ? (
              <div className="mb-4">
                <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">Score: {score}</div>
              </div>
            ) : (
              <div className="text-slate-400 mb-4">
                Bepaal of de tekstkleur overeenkomt met het woord
              </div>
            )}
            <Button onClick={startGame} className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Play className="w-4 h-4 mr-2" />
              {gameOver ? 'Opnieuw' : 'Start'}
            </Button>
          </div>
        )}
      </div>

      {gameRunning && (
        <div className="flex gap-4">
          <Button
            onClick={() => handleAnswer(true)}
            className="bg-green-600 hover:bg-green-700 px-8 py-6 text-lg"
          >
            ✓ Ja
          </Button>
          <Button
            onClick={() => handleAnswer(false)}
            className="bg-red-600 hover:bg-red-700 px-8 py-6 text-lg"
          >
            ✗ Nee
          </Button>
        </div>
      )}
    </div>
  );
}