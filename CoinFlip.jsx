import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

export default function CoinFlip({ onGameEnd }) {
  const [result, setResult] = useState(null);
  const [guess, setGuess] = useState(null);
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [flipping, setFlipping] = useState(false);

  const flip = (playerGuess) => {
    setFlipping(true);
    setGuess(playerGuess);

    setTimeout(() => {
      const coinResult = Math.random() > 0.5 ? 'heads' : 'tails';
      setResult(coinResult);
      setFlipping(false);

      const newRounds = rounds + 1;
      setRounds(newRounds);

      if (coinResult === playerGuess) {
        setScore(score + 1);
      }

      if (newRounds >= 10) {
        setTimeout(() => onGameEnd && onGameEnd(score), 1500);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white">
        <div className="text-2xl font-bold">Score: {score}/10</div>
        <div>Ronde: {rounds}/10</div>
      </div>

      <motion.div
        animate={flipping ? { rotateY: 360 } : {}}
        transition={{ duration: 1 }}
        className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-6xl shadow-lg"
      >
        {result === 'heads' ? '👑' : result === 'tails' ? '💰' : '?'}
      </motion.div>

      {result && !flipping && (
        <div className="text-white text-xl">
          {result === guess ? '✅ Goed!' : '❌ Fout!'}
        </div>
      )}

      {rounds < 10 && !flipping && (
        <div className="flex gap-4">
          <Button onClick={() => flip('heads')} className="bg-purple-600">
            👑 Kop
          </Button>
          <Button onClick={() => flip('tails')} className="bg-pink-600">
            💰 Munt
          </Button>
        </div>
      )}

      {rounds >= 10 && (
        <div className="text-white text-xl">
          Eindresultaat: {score}/10
        </div>
      )}
    </div>
  );
}