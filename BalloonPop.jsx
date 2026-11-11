import React, { useState, useEffect } from 'react';

export default function BalloonPop({ onGameEnd }) {
  const [balloons, setBalloons] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (!gameOver && timeLeft > 0) {
        setBalloons(prev => [
          ...prev,
          {
            id: Date.now(),
            x: Math.random() * 300,
            y: 400,
            color: ['🎈', '🎈', '🎈', '💣'][Math.floor(Math.random() * 4)]
          }
        ]);
      }
    }, 800);

    return () => clearInterval(spawnInterval);
  }, [gameOver, timeLeft]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      if (!gameOver && timeLeft > 0) {
        setBalloons(prev => prev.map(b => ({ ...b, y: b.y - 5 })).filter(b => b.y > 0));
        setTimeLeft(t => {
          if (t <= 1) {
            setGameOver(true);
            onGameEnd && onGameEnd(score);
            return 0;
          }
          return t - 1;
        });
      }
    }, 100);

    return () => clearInterval(moveInterval);
  }, [gameOver, timeLeft, score, onGameEnd]);

  const pop = (balloon) => {
    if (balloon.color === '💣') {
      setGameOver(true);
      onGameEnd && onGameEnd(score);
    } else {
      setScore(score + 1);
    }
    setBalloons(prev => prev.filter(b => b.id !== balloon.id));
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white">
        <div className="text-2xl font-bold">Score: {score}</div>
        <div>Tijd: {timeLeft}s</div>
      </div>

      <div className="relative w-80 h-96 bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg overflow-hidden">
        {balloons.map(balloon => (
          <div
            key={balloon.id}
            onClick={() => pop(balloon)}
            className="absolute text-4xl cursor-pointer hover:scale-110 transition-transform"
            style={{ left: balloon.x, top: balloon.y }}
          >
            {balloon.color}
          </div>
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