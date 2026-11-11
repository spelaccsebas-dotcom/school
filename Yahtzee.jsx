import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

export default function Yahtzee({ onGameEnd }) {
  const [dice, setDice] = useState([1, 2, 3, 4, 5]);
  const [held, setHeld] = useState([false, false, false, false, false]);
  const [rolls, setRolls] = useState(3);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  const rollDice = () => {
    if (rolls === 0) return;
    const newDice = dice.map((d, i) => held[i] ? d : Math.floor(Math.random() * 6) + 1);
    setDice(newDice);
    setRolls(rolls - 1);
  };

  const toggleHold = (index) => {
    const newHeld = [...held];
    newHeld[index] = !newHeld[index];
    setHeld(newHeld);
  };

  const calculateScore = () => {
    const sum = dice.reduce((a, b) => a + b, 0);
    const counts = {};
    dice.forEach(d => counts[d] = (counts[d] || 0) + 1);
    const maxCount = Math.max(...Object.values(counts));
    
    if (maxCount === 5) return sum + 50; // Yahtzee
    if (maxCount === 4) return sum + 30;
    if (maxCount === 3) return sum + 20;
    return sum;
  };

  const endRound = () => {
    const roundScore = calculateScore();
    const newScore = score + roundScore;
    setScore(newScore);
    
    if (round >= 5) {
      setGameOver(true);
      onGameEnd && onGameEnd(newScore);
    } else {
      setRound(round + 1);
      setRolls(3);
      setHeld([false, false, false, false, false]);
    }
  };

  const resetGame = () => {
    setDice([1, 2, 3, 4, 5]);
    setHeld([false, false, false, false, false]);
    setRolls(3);
    setScore(0);
    setRound(1);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white">
        <div className="text-2xl font-bold">Score: {score}</div>
        <div>Ronde: {round}/5 | Worpen: {rolls}</div>
      </div>

      <div className="flex gap-2">
        {dice.map((d, i) => (
          <div
            key={i}
            onClick={() => toggleHold(i)}
            className={`w-12 h-12 bg-white rounded flex items-center justify-center text-2xl cursor-pointer ${
              held[i] ? 'ring-4 ring-yellow-400' : ''
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {!gameOver ? (
        <div className="flex gap-2">
          <Button onClick={rollDice} disabled={rolls === 0} className="bg-purple-600">
            Gooi ({rolls})
          </Button>
          <Button onClick={endRound} className="bg-green-600">
            Eindig Ronde
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-white text-xl mb-2">Spel voorbij! Score: {score}</div>
          <Button onClick={resetGame}>Opnieuw</Button>
        </div>
      )}
    </div>
  );
}