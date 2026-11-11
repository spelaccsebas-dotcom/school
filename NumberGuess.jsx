import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, Trophy, RotateCcw } from 'lucide-react';

export default function NumberGuess({ onGameEnd }) {
  const [target, setTarget] = useState(0);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [gameWon, setGameWon] = useState(false);
  const [range, setRange] = useState({ min: 1, max: 100 });

  const startNewGame = () => {
    setTarget(Math.floor(Math.random() * 100) + 1);
    setGuess('');
    setAttempts([]);
    setGameWon(false);
    setRange({ min: 1, max: 100 });
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const handleGuess = () => {
    const num = parseInt(guess);
    if (isNaN(num) || num < 1 || num > 100) return;

    const newAttempt = {
      number: num,
      direction: num < target ? 'up' : num > target ? 'down' : 'correct'
    };

    setAttempts(prev => [...prev, newAttempt]);
    
    if (num < target) {
      setRange(prev => ({ ...prev, min: Math.max(prev.min, num + 1) }));
    } else if (num > target) {
      setRange(prev => ({ ...prev, max: Math.min(prev.max, num - 1) }));
    }

    if (num === target) {
      setGameWon(true);
      const score = Math.max(1000 - (attempts.length * 100), 100);
      onGameEnd(score);
    }

    setGuess('');
  };

  return (
    <div className="flex flex-col items-center gap-6 max-w-md w-full">
      <div className="flex items-center justify-between w-full">
        <div className="text-purple-300">
          Pogingen: <span className="font-bold text-white">{attempts.length}</span>
        </div>
        <Button onClick={startNewGame} variant="outline" size="sm" className="border-purple-500/30 hover:bg-purple-500/20">
          <RotateCcw className="w-4 h-4 mr-2" />
          Nieuw spel
        </Button>
      </div>

      <div className="text-center">
        <div className="text-slate-400 mb-2">Raad het getal tussen</div>
        <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {range.min} - {range.max}
        </div>
      </div>

      {!gameWon && (
        <div className="flex gap-3 w-full">
          <Input
            type="number"
            min="1"
            max="100"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
            placeholder="Voer een getal in..."
            className="bg-slate-800/50 border-purple-500/30 text-white text-center text-xl"
          />
          <Button onClick={handleGuess} className="bg-gradient-to-r from-purple-500 to-pink-500 px-6">
            Raad
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-center">
        <AnimatePresence>
          {attempts.map((attempt, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                attempt.direction === 'up' 
                  ? 'bg-blue-500/20 text-blue-300' 
                  : attempt.direction === 'down'
                  ? 'bg-orange-500/20 text-orange-300'
                  : 'bg-green-500/20 text-green-300'
              }`}
            >
              {attempt.number}
              {attempt.direction === 'up' && <ArrowUp className="w-3 h-3" />}
              {attempt.direction === 'down' && <ArrowDown className="w-3 h-3" />}
              {attempt.direction === 'correct' && <Trophy className="w-3 h-3" />}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {gameWon && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-2xl font-bold text-green-400 flex items-center gap-2 justify-center mb-2">
            <Trophy className="w-6 h-6" />
            Gefeliciteerd!
          </div>
          <div className="text-slate-400">
            Je raadde {target} in {attempts.length} pogingen!
          </div>
        </motion.div>
      )}
    </div>
  );
}