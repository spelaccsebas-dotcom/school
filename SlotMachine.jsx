import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '7️⃣', '💎'];

export default function SlotMachine({ onGameEnd }) {
  const [reels, setReels] = useState(['🍒', '🍒', '🍒']);
  const [spinning, setSpinning] = useState(false);
  const [credits, setCredits] = useState(10);
  const [wins, setWins] = useState(0);

  const spin = () => {
    if (credits === 0 || spinning) return;

    setSpinning(true);
    setCredits(credits - 1);

    setTimeout(() => {
      const newReels = [
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ];
      setReels(newReels);
      setSpinning(false);

      if (newReels[0] === newReels[1] && newReels[1] === newReels[2]) {
        const win = newReels[0] === '💎' ? 10 : newReels[0] === '7️⃣' ? 5 : 3;
        setCredits(c => c + win);
        setWins(w => w + 1);
      }

      if (credits - 1 === 0) {
        onGameEnd && onGameEnd(wins);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white text-2xl font-bold">
        Credits: {credits} | Wins: {wins}
      </div>

      <div className="flex gap-4 p-8 bg-gradient-to-br from-yellow-600 to-red-600 rounded-xl">
        {reels.map((symbol, i) => (
          <div
            key={i}
            className={`w-20 h-20 bg-white rounded-lg flex items-center justify-center text-5xl ${
              spinning ? 'animate-spin' : ''
            }`}
          >
            {symbol}
          </div>
        ))}
      </div>

      <Button
        onClick={spin}
        disabled={credits === 0 || spinning}
        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-2xl px-8 py-6"
      >
        {spinning ? 'Draaien...' : 'SPIN'}
      </Button>

      {credits === 0 && (
        <div className="text-white text-xl">
          Game Over! Wins: {wins}
        </div>
      )}
    </div>
  );
}