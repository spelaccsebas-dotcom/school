import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

export default function PatternMatch({ onGameEnd }) {
  const [pattern, setPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [showing, setShowing] = useState(false);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    startLevel();
  }, []);

  const startLevel = () => {
    const newPattern = Array(3 + level).fill(0).map(() => Math.floor(Math.random() * 4));
    setPattern(newPattern);
    setUserPattern([]);
    showPattern(newPattern);
  };

  const showPattern = async (pat) => {
    setShowing(true);
    await new Promise(r => setTimeout(r, 1000));
    
    for (let i = 0; i < pat.length; i++) {
      const el = document.getElementById(`btn-${pat[i]}`);
      if (el) {
        el.classList.add('ring-4', 'ring-yellow-400');
        await new Promise(r => setTimeout(r, 500));
        el.classList.remove('ring-4', 'ring-yellow-400');
        await new Promise(r => setTimeout(r, 200));
      }
    }
    
    setShowing(false);
  };

  const handleClick = (num) => {
    if (showing || gameOver) return;

    const newUserPattern = [...userPattern, num];
    setUserPattern(newUserPattern);

    if (pattern[newUserPattern.length - 1] !== num) {
      setGameOver(true);
      onGameEnd && onGameEnd((level - 1) * 10);
    } else if (newUserPattern.length === pattern.length) {
      setLevel(level + 1);
      setTimeout(() => startLevel(), 1000);
    }
  };

  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white text-2xl font-bold">Level: {level}</div>

      <div className="grid grid-cols-2 gap-4">
        {colors.map((color, i) => (
          <button
            key={i}
            id={`btn-${i}`}
            onClick={() => handleClick(i)}
            className={`w-24 h-24 rounded-lg ${color} transition-all`}
            disabled={showing || gameOver}
          />
        ))}
      </div>

      {gameOver && (
        <div className="text-white text-xl">
          Game Over! Level: {level - 1}
        </div>
      )}
    </div>
  );
}