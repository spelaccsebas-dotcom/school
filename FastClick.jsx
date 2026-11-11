import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

export default function FastClick({ onGameEnd }) {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (!started || timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameOver(true);
          onGameEnd && onGameEnd(clicks);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, timeLeft, clicks, onGameEnd]);

  const handleClick = () => {
    if (!started) {
      setStarted(true);
    }
    if (!gameOver) {
      setClicks(clicks + 1);
    }
  };

  const resetGame = () => {
    setClicks(0);
    setTimeLeft(10);
    setStarted(false);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white text-2xl font-bold">
        {gameOver ? 'Game Over!' : started ? `Tijd: ${timeLeft}s` : 'Klik om te starten'}
      </div>

      <div className="text-white text-6xl font-bold">{clicks}</div>

      <Button
        onClick={handleClick}
        disabled={gameOver}
        className="w-48 h-48 text-4xl bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"
      >
        KLIK!
      </Button>

      {gameOver && (
        <>
          <div className="text-white text-xl">
            Je klikte {clicks} keer!
          </div>
          <Button onClick={resetGame}>Opnieuw</Button>
        </>
      )}
    </div>
  );
}