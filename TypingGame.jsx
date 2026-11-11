import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { Play, Timer, Trophy, Keyboard } from 'lucide-react';

const WORDS = [
  'programmeren', 'computer', 'toetsenbord', 'scherm', 'muis',
  'internet', 'website', 'browser', 'software', 'hardware',
  'database', 'server', 'netwerk', 'bestand', 'map',
  'downloaden', 'uploaden', 'klikken', 'scrollen', 'typen',
  'wachtwoord', 'gebruiker', 'systeem', 'applicatie', 'venster'
];

export default function TypingGame({ onGameEnd }) {
  const [currentWord, setCurrentWord] = useState('');
  const [typedWord, setTypedWord] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [wordsTyped, setWordsTyped] = useState(0);

  const getNewWord = useCallback(() => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(word);
    setTypedWord('');
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(45);
    setWordsTyped(0);
    setGameRunning(true);
    setGameOver(false);
    getNewWord();
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
      onGameEnd(score);
    }
  }, [gameOver, score, onGameEnd]);

  useEffect(() => {
    if (!gameRunning) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Backspace') {
        setTypedWord(prev => prev.slice(0, -1));
      } else if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        const newTyped = typedWord + e.key.toLowerCase();
        setTypedWord(newTyped);

        if (newTyped === currentWord) {
          setScore(s => s + currentWord.length * 10);
          setWordsTyped(w => w + 1);
          getNewWord();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameRunning, typedWord, currentWord, getNewWord]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center justify-between w-full max-w-md">
        <div className="text-purple-300 flex items-center gap-2">
          <Timer className="w-5 h-5" />
          <span className="font-bold text-white text-xl">{timeLeft}s</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-purple-300">
            Woorden: <span className="font-bold text-white">{wordsTyped}</span>
          </div>
          <div className="text-purple-300">
            Score: <span className="font-bold text-white text-xl">{score}</span>
          </div>
        </div>
      </div>

      <div className="relative bg-slate-800/50 rounded-2xl p-8 border border-purple-500/20 min-w-[350px]">
        {gameRunning ? (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Keyboard className="w-8 h-8 text-purple-400" />
            </div>
            <motion.div
              key={currentWord}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-mono mb-4"
            >
              {currentWord.split('').map((char, i) => (
                <span
                  key={i}
                  className={`${
                    i < typedWord.length
                      ? typedWord[i] === char
                        ? 'text-green-400'
                        : 'text-red-400'
                      : 'text-white'
                  }`}
                >
                  {char}
                </span>
              ))}
            </motion.div>
            <div className="h-8 text-xl text-purple-400 font-mono">
              {typedWord}
              <span className="animate-pulse">|</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            {gameOver ? (
              <div className="mb-4">
                <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">Score: {score}</div>
                <div className="text-purple-300">{wordsTyped} woorden getypt</div>
              </div>
            ) : (
              <div className="text-slate-400 mb-4">
                Typ de woorden zo snel mogelijk!
              </div>
            )}
            <Button onClick={startGame} className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Play className="w-4 h-4 mr-2" />
              {gameOver ? 'Opnieuw' : 'Start'}
            </Button>
          </div>
        )}
      </div>

      {!gameRunning && !gameOver && (
        <p className="text-slate-500 text-sm">Gebruik je toetsenbord om te typen</p>
      )}
    </div>
  );
}