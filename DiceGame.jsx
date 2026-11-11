import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

export default function DiceGame({ onGameEnd }) {
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [playerDice, setPlayerDice] = useState([1, 1]);
  const [computerDice, setComputerDice] = useState([1, 1]);
  const [rolling, setRolling] = useState(false);
  const [winner, setWinner] = useState(null);
  const [round, setRound] = useState(1);

  const rollDice = () => {
    setRolling(true);
    
    setTimeout(() => {
      const pDice = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
      const cDice = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
      
      setPlayerDice(pDice);
      setComputerDice(cDice);
      
      const pTotal = pDice[0] + pDice[1];
      const cTotal = cDice[0] + cDice[1];
      
      let newPlayerScore = playerScore;
      let newComputerScore = computerScore;
      
      if (pTotal > cTotal) {
        newPlayerScore += 1;
        setPlayerScore(newPlayerScore);
      } else if (cTotal > pTotal) {
        newComputerScore += 1;
        setComputerScore(newComputerScore);
      }
      
      setRolling(false);
      
      if (round >= 5) {
        if (newPlayerScore > newComputerScore) {
          setWinner('player');
          onGameEnd && onGameEnd(newPlayerScore);
        } else if (newComputerScore > newPlayerScore) {
          setWinner('computer');
          onGameEnd && onGameEnd(0);
        } else {
          setWinner('draw');
          onGameEnd && onGameEnd(newPlayerScore);
        }
      } else {
        setRound(round + 1);
      }
    }, 500);
  };

  const resetGame = () => {
    setPlayerScore(0);
    setComputerScore(0);
    setPlayerDice([1, 1]);
    setComputerDice([1, 1]);
    setWinner(null);
    setRound(1);
  };

  const DiceDisplay = ({ value }) => {
    const dots = [];
    const dotPositions = {
      1: [[50, 50]],
      2: [[25, 25], [75, 75]],
      3: [[25, 25], [50, 50], [75, 75]],
      4: [[25, 25], [75, 25], [25, 75], [75, 75]],
      5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
      6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]]
    };

    return (
      <div className="w-16 h-16 bg-white rounded-lg relative shadow-lg">
        {dotPositions[value]?.map((pos, idx) => (
          <div
            key={idx}
            className="absolute w-3 h-3 bg-slate-900 rounded-full"
            style={{ left: `${pos[0]}%`, top: `${pos[1]}%`, transform: 'translate(-50%, -50%)' }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-white text-lg font-semibold">
        Ronde {round} / 5
      </div>

      <div className="grid grid-cols-2 gap-8 w-full">
        <div className="flex flex-col items-center gap-3">
          <div className="text-white font-bold">Jij</div>
          <div className="flex gap-2">
            {playerDice.map((die, idx) => (
              <motion.div
                key={idx}
                animate={rolling ? { rotate: 360 } : {}}
                transition={{ duration: 0.5 }}
              >
                <DiceDisplay value={die} />
              </motion.div>
            ))}
          </div>
          <div className="text-2xl font-bold text-green-400">{playerScore}</div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="text-white font-bold">Computer</div>
          <div className="flex gap-2">
            {computerDice.map((die, idx) => (
              <motion.div
                key={idx}
                animate={rolling ? { rotate: -360 } : {}}
                transition={{ duration: 0.5 }}
              >
                <DiceDisplay value={die} />
              </motion.div>
            ))}
          </div>
          <div className="text-2xl font-bold text-red-400">{computerScore}</div>
        </div>
      </div>

      {winner ? (
        <div className="text-center">
          <div className="text-white text-2xl font-bold mb-4">
            {winner === 'player' ? '🎉 Je hebt gewonnen!' : winner === 'computer' ? '😢 Computer wint!' : '🤝 Gelijkspel!'}
          </div>
          <Button onClick={resetGame} className="bg-purple-600 hover:bg-purple-700">
            Opnieuw Spelen
          </Button>
        </div>
      ) : (
        <Button
          onClick={rollDice}
          disabled={rolling}
          className="bg-gradient-to-r from-purple-500 to-pink-500"
        >
          {rolling ? 'Dobbelstenen rollen...' : 'Gooi Dobbelstenen'}
        </Button>
      )}
    </div>
  );
}