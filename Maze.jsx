import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from 'framer-motion';
import { Play, Timer, Trophy, Zap } from 'lucide-react';

export default function MathRace({ onGameEnd }) {
  const [problem, setProblem] = useState(null);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const generateProblem = useCallback(() => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, correct;

    switch (op) {
      case '+':
        a = Math.floor(Math.random() * 50) + 1;
        b = Math.floor(Math.random() * 50) + 1;
        correct = a + b;
        break;
      case '-':
        a = Math.floor(Math.random() * 50) + 10;
        b = Math.floor(Math.random() * a);
        correct = a - b;
        break;
      case '×':
        a = Math.floor(Math.random() * 12) + 1;
        b = Math.floor(Math.random() * 12) + 1;
        correct = a * b;
        break;
    }

    setProblem({ a, b, op, correct });
    setAnswer('');
  }, []);

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    setGameRunning(true);
    setGameOver(false);
    generateProblem();
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
      onGameEnd(score * 10 + streak * 5);
    }
  }, [gameOver, score, streak, onGameEnd]);

  const checkAnswer = () => {
    if (parseInt(answer) === problem.correct) {
      setScore(s => s + 1 + Math.floor(streak / 3));
      setStreak(s => s + 1);
      generateProblem();
    } else {
      setStreak(0);
      setAnswer('');
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center justify-between w-full max-w-sm">
        <div className="text-purple-300 flex items-center gap-2">
          <Timer className="w-5 h-5" />
          <span className="font-bold text-white text-xl">{timeLeft}s</span>
        </div>
        <div className="flex items-center gap-4">
          {streak >= 3 && (
            <div className="flex items-center gap-1 text-yellow-400">
              <Zap className="w-4 h-4" />
              <span className="font-bold">{streak}x</span>
            </div>
          )}
          <div className="text-purple-300">
            Score: <span className="font-bold text-white text-xl">{score}</span>
          </div>
        </div>
      </div>

      <div className="relative bg-slate-800/50 rounded-2xl p-8 border border-purple-500/20 min-w-[320px]">
        {gameRunning ? (
          <motion.div
            key={`${problem?.a}-${problem?.op}-${problem?.b}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-4xl font-bold text-white mb-6">
              {problem?.a} {problem?.op} {problem?.b} = ?
            </div>
            <div className="flex gap-3">
              <Input
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                placeholder="Antwoord..."
                className="bg-slate-900/50 border-purple-500/30 text-white text-center text-2xl"
                autoFocus
              />
              <Button onClick={checkAnswer} className="bg-gradient-to-r from-purple-500 to-pink-500 px-6">
                ✓
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-8">
            {gameOver ? (
              <div className="mb-4">
                <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">Score: {score}</div>
                <div className="text-purple-300">Hoogste streak: {streak}</div>
              </div>
            ) : (
              <div className="text-slate-400 mb-4">
                Los zo veel mogelijk sommen op in 60 seconden!
              </div>
            )}
            <Button onClick={startGame} className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Play className="w-4 h-4 mr-2" />
              {gameOver ? 'Opnieuw' : 'Start'}
            </Button>
          </div>
        )}
      </div>

      {gameRunning && streak >= 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-yellow-400 text-sm"
        >
          🔥 {streak}x streak! +{Math.floor(streak / 3)} bonus punten per goed antwoord!
        </motion.div>
      )}
    </div>
  );
}