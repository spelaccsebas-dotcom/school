import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

export default function Concentration({ onGameEnd }) {
  const [sequence, setSequence] = useState([]);
  const [playerSeq, setPlayerSeq] = useState([]);
  const [displaying, setDisplaying] = useState(false);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (level === 1) {
      startRound();
    }
  }, []);

  const startRound = () => {
    const newSeq = [...sequence, Math.floor(Math.random() * 9)];
    setSequence(newSeq);
    setPlayerSeq([]);
    displaySequence(newSeq);
  };

  const displaySequence = async (seq) => {
    setDisplaying(true);
    for (let i of seq) {
      await new Promise(resolve => {
        setTimeout(() => {
          const el = document.getElementById(`cell-${i}`);
          if (el) {
            el.classList.add('bg-yellow-400');
            setTimeout(() => {
              el.classList.remove('bg-yellow-400');
              resolve();
            }, 500);
          } else {
            resolve();
          }
        }, 500);
      });
    }
    setDisplaying(false);
  };

  const handleClick = (index) => {
    if (displaying || gameOver) return;

    const newPlayerSeq = [...playerSeq, index];
    setPlayerSeq(newPlayerSeq);

    if (sequence[newPlayerSeq.length - 1] !== index) {
      setGameOver(true);
      onGameEnd && onGameEnd((level - 1) * 10);
    } else if (newPlayerSeq.length === sequence.length) {
      setLevel(level + 1);
      setTimeout(() => startRound(), 1000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white">
        <div className="text-2xl font-bold">Level: {level}</div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            id={`cell-${i}`}
            onClick={() => handleClick(i)}
            className="w-20 h-20 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
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