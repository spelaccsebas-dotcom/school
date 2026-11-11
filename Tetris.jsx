import React, { useState, useEffect } from 'react';

export default function TargetShoot({ onGameEnd }) {
  const [targets, setTargets] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (timeLeft > 0 && !gameOver) {
        setTimeLeft(t => t - 1);
        
        if (Math.random() > 0.7) {
          setTargets(prev => [
            ...prev,
            {
              id: Date.now(),
              x: Math.random() * 300,
              y: Math.random() * 300,
              size: 20 + Math.random() * 30
            }
          ]);
        }
      } else if (timeLeft === 0) {
        setGameOver(true);
        onGameEnd && onGameEnd(score);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, gameOver, score, onGameEnd]);

  const shootTarget = (id) => {
    setTargets(prev => prev.filter(t => t.id !== id));
    setScore(score + 10);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white">
        <div className="text-2xl font-bold">Score: {score}</div>
        <div>Tijd: {timeLeft}s</div>
      </div>

      <div className="relative w-80 h-80 bg-slate-800 rounded-lg overflow-hidden">
        {targets.map(target => (
          <div
            key={target.id}
            onClick={() => shootTarget(target.id)}
            className="absolute bg-red-500 rounded-full cursor-crosshair hover:bg-red-600"
            style={{
              left: target.x,
              top: target.y,
              width: target.size,
              height: target.size
            }}
          />
        ))}
      </div>

      {gameOver && (
        <div className="text-white text-xl">
          Eindresultaat: {score}
        </div>
      )}
    </div>
  );
}