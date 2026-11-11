import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

const WORDS = [
  'PROGRAMMEREN', 'COMPUTER', 'JAVASCRIPT', 'ONTWIKKELING', 'APPLICATIE',
  'WEBSITE', 'DATABASE', 'NETWERK', 'SOFTWARE', 'HARDWARE',
  'TOETSENBORD', 'SCHERM', 'INTERNET', 'BROWSER', 'ALGORITME'
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function Hangman({ onGameEnd }) {
  const [word, setWord] = useState('');
  const [guessed, setGuessed] = useState(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const startGame = useCallback(() => {
    const newWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setWord(newWord);
    setGuessed(new Set());
    setMistakes(0);
    setGameOver(false);
    setWon(false);
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame]);

  useEffect(() => {
    if (!word) return;

    const wordLetters = new Set(word.split(''));
    const guessedLetters = new Set([...guessed].filter(l => wordLetters.has(l)));
    
    if (guessedLetters.size === wordLetters.size && word.length > 0) {
      setWon(true);
      setGameOver(true);
      const score = Math.max(1000 - mistakes * 100, 100);
      onGameEnd(score);
    } else if (mistakes >= 6) {
      setGameOver(true);
      onGameEnd(0);
    }
  }, [word, guessed, mistakes, onGameEnd]);

  const handleGuess = (letter) => {
    if (gameOver || guessed.has(letter)) return;
    
    const newGuessed = new Set(guessed);
    newGuessed.add(letter);
    setGuessed(newGuessed);

    if (!word.includes(letter)) {
      setMistakes(m => m + 1);
    }
  };

  const renderWord = () => {
    return word.split('').map((letter, i) => (
      <div
        key={i}
        className="w-8 h-10 border-b-2 border-purple-500 flex items-center justify-center text-2xl font-bold text-white mx-1"
      >
        {guessed.has(letter) ? letter : ''}
      </div>
    ));
  };

  const drawHangman = () => {
    const parts = [
      // Head
      <circle key="head" cx="60" cy="40" r="15" stroke="#ffffff" strokeWidth="3" fill="none" />,
      // Body
      <line key="body" x1="60" y1="55" x2="60" y2="90" stroke="#ffffff" strokeWidth="3" />,
      // Left arm
      <line key="larm" x1="60" y1="65" x2="40" y2="75" stroke="#ffffff" strokeWidth="3" />,
      // Right arm
      <line key="rarm" x1="60" y1="65" x2="80" y2="75" stroke="#ffffff" strokeWidth="3" />,
      // Left leg
      <line key="lleg" x1="60" y1="90" x2="45" y2="110" stroke="#ffffff" strokeWidth="3" />,
      // Right leg
      <line key="rleg" x1="60" y1="90" x2="75" y2="110" stroke="#ffffff" strokeWidth="3" />
    ];

    return (
      <svg width="120" height="140" className="mx-auto">
        {/* Gallows */}
        <line x1="10" y1="130" x2="90" y2="130" stroke="#64748b" strokeWidth="3" />
        <line x1="30" y1="130" x2="30" y2="10" stroke="#64748b" strokeWidth="3" />
        <line x1="30" y1="10" x2="60" y2="10" stroke="#64748b" strokeWidth="3" />
        <line x1="60" y1="10" x2="60" y2="25" stroke="#64748b" strokeWidth="3" />
        
        {/* Person */}
        {parts.slice(0, mistakes)}
      </svg>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
      <div className="flex items-center justify-between w-full">
        <div className="text-purple-300">
          Fouten: <span className="font-bold text-white">{mistakes}/6</span>
        </div>
        <Button onClick={startGame} variant="outline" size="sm" className="border-purple-500/30 hover:bg-purple-500/20">
          <RotateCcw className="w-4 h-4 mr-2" />
          Nieuw woord
        </Button>
      </div>

      <div className="bg-slate-900/50 rounded-2xl p-6 border border-purple-500/20">
        {drawHangman()}
      </div>

      <div className="flex flex-wrap justify-center gap-1">
        {renderWord()}
      </div>

      <div className="grid grid-cols-7 gap-2 w-full">
        {ALPHABET.map(letter => (
          <motion.button
            key={letter}
            onClick={() => handleGuess(letter)}
            disabled={guessed.has(letter) || gameOver}
            whileHover={!guessed.has(letter) && !gameOver ? { scale: 1.1 } : {}}
            whileTap={{ scale: 0.95 }}
            className={`h-10 rounded-lg font-bold transition-all ${
              guessed.has(letter)
                ? word.includes(letter)
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 text-white opacity-50'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-purple-500/30'
            }`}
          >
            {letter}
          </motion.button>
        ))}
      </div>

      {won && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-green-400"
        >
          🎉 Gewonnen!
        </motion.div>
      )}

      {gameOver && !won && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-2xl font-bold text-red-400 mb-2">Game Over!</div>
          <div className="text-slate-400">Het woord was: <span className="text-white font-bold">{word}</span></div>
        </motion.div>
      )}
    </div>
  );
}