import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

export default function Maze({ onGameEnd }) {
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const maze = [
    [0, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
  ];

  useEffect(() => {
    const handleKey = (e) => {
      if (won) return;
      let newX = playerPos.x;
      let newY = playerPos.y;

      if (e.key === 'ArrowUp' && playerPos.y > 0) newY--;
      if (e.key === 'ArrowDown' && playerPos.y < 6) newY++;
      if (e.key === 'ArrowLeft' && playerPos.x > 0) newX--;
      if (e.key === 'ArrowRight' && playerPos.x < 7) newX++;

      if (maze[newY][newX] === 0) {
        setPlayerPos({ x: newX, y: newY });
        setMoves(moves + 1);

        if (newX === 7 && newY === 5) {
          setWon(true);
          onGameEnd && onGameEnd(100 - moves);
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [playerPos, moves, won, onGameEnd]);

  const move = (dx, dy) => {
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;
    if (newX >= 0 && newX < 8 && newY >= 0 && newY < 7 && maze[newY][newX] === 0) {
      setPlayerPos({ x: newX, y: newY });
      setMoves(moves + 1);
      if (newX === 7 && newY === 5) {
        setWon(true);
        onGameEnd && onGameEnd(100 - moves);
      }
    }
  };

  const resetGame = () => {
    setPlayerPos({ x: 0, y: 0 });
    setMoves(0);
    setWon(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white font-semibold">Zetten: {moves}</div>

      <div className="grid grid-cols-8 gap-1">
        {maze.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`w-10 h-10 ${
                x === playerPos.x && y === playerPos.y
                  ? 'bg-blue-500'
                  : x === 7 && y === 5
                  ? 'bg-green-500'
                  : cell === 1
                  ? 'bg-slate-800'
                  : 'bg-slate-600'
              }`}
            >
              {x === playerPos.x && y === playerPos.y && '😊'}
              {x === 7 && y === 5 && '🏁'}
            </div>
          ))
        )}
      </div>

      {won && (
        <div className="text-center">
          <div className="text-white text-xl mb-2">Gelukt in {moves} zetten!</div>
          <Button onClick={resetGame}>Opnieuw</Button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <div></div>
        <Button onClick={() => move(0, -1)} size="sm">↑</Button>
        <div></div>
        <Button onClick={() => move(-1, 0)} size="sm">←</Button>
        <div></div>
        <Button onClick={() => move(1, 0)} size="sm">→</Button>
        <div></div>
        <Button onClick={() => move(0, 1)} size="sm">↓</Button>
        <div></div>
      </div>
    </div>
  );
}